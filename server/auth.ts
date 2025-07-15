import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertHealer } from "@shared/schema";
import { validateEmailAddress } from "./email-validator";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  if (!stored || !stored.includes(".")) {
    console.error("Invalid stored password format:", stored);
    return false;
  }
  
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    console.error("Missing hash or salt in stored password");
    return false;
  }
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "aurfy-spiritual-wellness-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? undefined : undefined,
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport to use a local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // First check if this is a healer login
        const healer = await storage.getHealerByUsername(username);
        if (healer && await comparePasswords(password, healer.password)) {
          // Return healer as authenticated user with healer type
          const healerUser = {
            id: healer.id,
            username: healer.username,
            password: healer.password,
            userType: "healer" as const,
            birthDate: null,
            createdAt: healer.createdAt,
            healerData: healer // Store full healer data for dashboard access
          };
          return done(null, healerUser);
        }
        
        // If not a healer, check regular users
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, { id: user.id, userType: user.userType });
  });
  
  passport.deserializeUser(async (userData: any, done) => {
    try {
      const { id, userType } = userData;
      
      if (userType === 'healer') {
        // For healers, get the healer data directly
        const healer = await storage.getHealer(id);
        if (healer) {
          const healerUser = {
            id: healer.id,
            username: healer.username,
            password: healer.password,
            userType: "healer" as const,
            birthDate: null,
            createdAt: healer.createdAt,
            healerData: healer
          };
          done(null, healerUser);
        } else {
          done(null, false);
        }
      } else {
        // For regular users, get from users table
        const user = await storage.getUser(id);
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      }
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Validate email address if provided
      if (req.body.email) {
        const emailValidation = await validateEmailAddress(req.body.email);
        
        if (!emailValidation.isValid) {
          return res.status(400).json({ 
            message: "Email validation failed", 
            error: emailValidation.message,
            deliverability: emailValidation.deliverability
          });
        }
        
        // Log successful email validation
        console.log(`Email validation successful for ${req.body.email}: ${emailValidation.message}`);
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        userType: "client", // All registrations default to client type
        credits: 10 // Give new users 10 credits
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.status(200).json(userWithoutPassword);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let user = req.user as any;
      
      // Check if user exists in healers database and update userType accordingly
      const healers = await storage.getAllHealers();
      const healerMatch = healers.find(h => h.email === `${user.username}@spiritualwellness.com` || h.name === user.username);
      
      if (healerMatch && user.userType !== "healer") {
        // Update user to healer type if they exist in healers database
        user = { ...user, userType: "healer" };
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error checking healer status:", error);
      // Fallback to original user data
      const { password, ...userWithoutPassword } = req.user as any;
      res.json(userWithoutPassword);
    }
  });
}

// Authentication middleware
export function isAuthenticated(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
