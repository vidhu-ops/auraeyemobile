import { db } from "./server/db";
import { healers, users } from "./shared/schema";
import { eq, notInArray } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function run() {
  const password = await hashPassword("password123");
  
  // 1. First, delete all healers EXCEPT Nishant Sharma to reset the order
  // Nishant's username is nishant.sharma2
  console.log("Cleaning up healers table...");
  await db.delete(healers).where(notInArray(healers.username, ["nishant.sharma2"]));

  // 2. Add Sunita Mann
  console.log("Adding Sunita Mann...");
  await db.insert(healers).values({
    name: "Sunita Mann",
    username: "sunita_mann",
    password,
    specialty: "Spiritual Teacher & Healer",
    description: "Sunita Mann is a spiritual teacher & healer with over 20 years of experience. Trained in Aura reading, Reiki healing, and Angel’s therapy. 95% success rate in spiritual evaluation. Energy Diagnosis + Detailed Insight Report: Rs. 5000 | Distance Healing Session: Rs. 7500",
    email: "sunita@auraeye.com",
    phone: "+91-XXXXXXXXXX",
    experience: "20+ years",
    location: "India",
    imageUrl: "/healer-sunita.jpg",
  });

  // 3. Add Mr. Subramayanam
  console.log("Adding Mr. Subramayanam...");
  await db.insert(healers).values({
    name: "Mr. Subramayanam",
    username: "subramayanam",
    password,
    specialty: "Energy Healer & Engineer",
    description: "Mechanical Engineer and Aura Reader who blends analytical precision with intuitive insight. Specializes in identifying energetic imbalances at their root cause. Energy Diagnosis + Detailed Insight Report: Rs. 5000 | Distance Healing Session: Rs. 7500",
    email: "subramayanam@auraeye.com",
    phone: "+91-XXXXXXXXXX",
    experience: "15+ years",
    location: "India",
    imageUrl: "/healer-subramanyam.jpg",
  });

  // 4. Ensure users exist
  const healersData = [
    { username: "sunita_mann", name: "Sunita Mann", email: "sunita@auraeye.com" },
    { username: "subramayanam", name: "Mr. Subramayanam", email: "subramayanam@auraeye.com" }
  ];

  for (const data of healersData) {
    const [existingUser] = await db.select().from(users).where(eq(users.username, data.username));
    if (existingUser) {
      await db.update(users).set({ userType: "healer" }).where(eq(users.username, data.username));
    } else {
      await db.insert(users).values({
        username: data.username,
        password,
        name: data.name,
        email: data.email,
        userType: "healer",
        credits: 100
      });
    }
  }

  console.log("Healer order finalized.");
  process.exit(0);
}

run();
