import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertHealer } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
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
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Check if user exists in healers database and update userType accordingly
          const healers = await storage.getAllHealers();
          const healerMatch = healers.find(h => h.email === `${username}@spiritualwellness.com` || h.name === username);
          
          if (healerMatch) {
            // Update user to healer type if they exist in healers database
            const updatedUser = { ...user, userType: "healer" as const };
            return done(null, updatedUser);
          }
          
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        // Check if user exists in healers database and update userType accordingly
        const healers = await storage.getAllHealers();
        const healerMatch = healers.find(h => h.email === `${user.username}@spiritualwellness.com` || h.name === user.username);
        
        if (healerMatch) {
          // Update user to healer type if they exist in healers database
          const updatedUser = { ...user, userType: "healer" as const };
          done(null, updatedUser);
        } else {
          done(null, user);
        }
      } else {
        done(null, false);
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

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        userType: "client" // All registrations default to client type
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
