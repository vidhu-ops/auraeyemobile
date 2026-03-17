import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertHealer } from "@shared/schema";
import { validateEmailAddress } from "./email-validator";
import { sendWelcomeEmail } from "./email-service";

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

export async function comparePasswords(supplied: string, stored: string, username: string = "unknown") {
  if (!stored) {
    console.error(`No stored password provided for ${username}`);
    return false;
  }
  
  // Check if it's a hashed password (contains a dot)
  if (stored.includes(".")) {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error(`Missing hash or salt in stored password for ${username}`);
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, hashedBuf.length)) as Buffer;
    
    // Ensure buffers are the same length before calling timingSafeEqual
    if (hashedBuf.length !== suppliedBuf.length) {
      console.error(`Hash length mismatch for ${username}: stored=${hashedBuf.length}, supplied=${suppliedBuf.length}`);
      return false;
    }
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } else {
    // It's a plain text password - compare directly
    console.log(`Comparing plain text password for healer: ${username}`);
    const result = supplied === stored;
    if (!result) {
      console.log(`Plain text comparison failed for ${username}`);
    }
    return result;
  }
}

export function setupAuth(app: Express) {
  // Detect if we're running on HTTPS (Replit preview or production)
  const isHttps = process.env.NODE_ENV === "production" || 
                  process.env.REPL_SLUG !== undefined || 
                  process.env.REPLIT_DEPLOYMENT === "1";
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "aurfy-spiritual-wellness-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: isHttps,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: isHttps ? "none" : "lax",
      domain: undefined,
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
        console.log(`[AUTH] Login attempt for: ${username}`);
        
        // First check if this is a healer login
        const healer = await storage.getHealerByUsername(username);
        if (healer) {
          console.log(`[AUTH] Found healer account for: ${username}`);
          const passwordMatch = await comparePasswords(password, healer.password, username);
          console.log(`[AUTH] Healer password match: ${passwordMatch}`);
          
          if (passwordMatch) {
            let userRecord = await storage.getUserByUsername(username);
            if (!userRecord) {
              console.log(`[AUTH] Creating missing user record for healer: ${username}`);
              userRecord = await storage.createUser({
                username: healer.username,
                password: healer.password,
                userType: "healer",
                credits: 100,
                soulEnergy: 0
              });
            }
            
            // Check if user account is active
            if (userRecord.isActive === false) {
              console.log(`[AUTH] Healer account is inactive: ${username}`);
              return done(null, false);
            }
            
            const healerUser = {
              id: userRecord.id,
              username: healer.username,
              name: healer.name,
              email: healer.email,
              password: healer.password,
              userType: "healer" as const,
              birthDate: userRecord.birthDate,
              createdAt: healer.createdAt,
              healerData: healer
            };
            return done(null, healerUser);
          } else {
            // Password didn't match as a healer, but don't stop yet - check regular users
            console.log(`[AUTH] Healer password mismatch for: ${username}, checking users table...`);
          }
        }
        
        // Check regular users
        const user = await storage.getUserByUsername(username);
        if (user) {
          console.log(`[AUTH] Found user account for: ${username}`);
          
          // Check if user account is active
          if (user.isActive === false) {
            console.log(`[AUTH] User account is inactive: ${username}`);
            return done(null, false);
          }
          
          const passwordMatch = await comparePasswords(password, user.password, username);
          console.log(`[AUTH] User password match: ${passwordMatch}`);
          
          if (passwordMatch) {
            return done(null, user);
          }
        }

        console.log(`[AUTH] Authentication failed for: ${username}`);
        return done(null, false);
      } catch (error) {
        console.error(`[AUTH] Error during authentication:`, error);
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
        // For healers, get both user and healer data
        const userRecord = await storage.getUser(id);
        if (userRecord && userRecord.userType === 'healer') {
          const healer = await storage.getHealerByUsername(userRecord.username);
          if (healer) {
            // Full healer with public profile
            const healerUser = {
              id: userRecord.id, // Use user record ID
              username: userRecord.username,
              name: healer.name,
              email: healer.email,
              password: userRecord.password,
              userType: "healer" as const,
              birthDate: userRecord.birthDate,
              createdAt: userRecord.createdAt,
              healerData: healer
            };
            done(null, healerUser);
          } else {
            // Backend-only healer account (not in public healers directory)
            const backendHealerUser = {
              id: userRecord.id,
              username: userRecord.username,
              name: userRecord.name,
              email: userRecord.email,
              password: userRecord.password,
              userType: "healer" as const,
              birthDate: userRecord.birthDate,
              createdAt: userRecord.createdAt,
              healerData: null // No public healer profile
            };
            done(null, backendHealerUser);
          }
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

      const plainPassword = req.body.password;
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        userType: "client", // All registrations default to client type
        credits: 5, // New clients start with 5 welcome credits
        soulEnergy: 0, // Start at 0% tree growth
        // Store onboarding preferences if provided during registration
        manifestIntention: req.body.manifestIntention || null,
        energyLevel: req.body.energyLevel || null,
        biggestBlock: req.body.biggestBlock || null,
        onboardingCompleted: req.body.manifestIntention ? true : false
      });

      // Send welcome email with username and password
      if (req.body.email) {
        try {
          await sendWelcomeEmail(req.body.email, req.body.username, plainPassword);
          console.log(`Welcome email sent to ${req.body.email}`);
        } catch (emailError) {
          console.error(`Failed to send welcome email to ${req.body.email}:`, emailError);
          // Don't fail the registration if email sending fails
        }
      }

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

  // Password update endpoint
  app.post("/api/user/password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await comparePasswords(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid current password" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ message: "Failed to update password" });
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
