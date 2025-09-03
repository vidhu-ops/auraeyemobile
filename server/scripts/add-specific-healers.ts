import { db } from "../db";
import { users, healers, creditTransactions } from "../../shared/schema";
import { hashPassword } from "../auth";
import { eq } from "drizzle-orm";

const specificHealerNames = [
  "Nishthaa.duseja",
  "Sharmila.Nagwekar", 
  "Ramona_Jind",
  "Sweta.Verma.Rawat"
];

const specialties = [
  "Spiritual Energy Healer",
  "Chakra Alignment Specialist", 
  "Aura Cleansing Expert",
  "Vedic Astrology Expert"
];

const locations = [
  "Delhi, India",
  "Mumbai, India",
  "Bangalore, India",
  "Chennai, India"
];

async function addSpecificHealers() {
  console.log(`🔮 Adding ${specificHealerNames.length} specific healer accounts...`);
  
  for (let i = 0; i < specificHealerNames.length; i++) {
    const username = specificHealerNames[i];
    
    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.username, username));
      
      if (existingUser.length > 0) {
        console.log(`⚠️  User ${username} already exists, skipping...`);
        continue;
      }

      // Create user account
      const hashedPassword = await hashPassword("healer123");
      
      const [newUser] = await db.insert(users).values({
        username: username,
        email: `${username.toLowerCase()}@aurfy.com`,
        password: hashedPassword,
        userType: "healer",
        credits: 150 // Starting with 150 credits
      }).returning();

      console.log(`✅ Created user: ${username} with ID: ${newUser.id}`);

      // Create healer profile (basic entry - not publicly visible as requested)
      const [newHealer] = await db.insert(healers).values({
        name: username.replace(/[._]/g, ' '), // Convert dots/underscores to spaces
        username: username,
        password: hashedPassword, // Same password as user account
        specialty: specialties[i % specialties.length],
        description: `Experienced ${specialties[i % specialties.length].toLowerCase()} with deep spiritual insights and healing abilities.`,
        email: `${username.toLowerCase()}@aurfy.com`,
        phone: "+91 " + Math.floor(1000000000 + Math.random() * 9000000000), // Random phone
        imageUrl: null,
        rating: Math.floor(4 + Math.random() * 2), // 4-5 rating as integer
        experience: `${Math.floor(Math.random() * 10) + 5} years`, // Experience as text
        location: locations[i % locations.length]
      }).returning();

      console.log(`✅ Created healer profile for: ${username}`);

      // Add initial credit transaction
      await db.insert(creditTransactions).values({
        userId: newUser.id,
        amount: 150,
        transactionType: "bonus",
        description: "Initial healer account credits",
        balanceAfter: 150
      });

      console.log(`💰 Added 150 initial credits for: ${username}`);

    } catch (error) {
      console.error(`❌ Error creating healer ${username}:`, error);
    }
  }

  console.log(`🎉 Specific healer accounts creation completed!`);
}

// Run the script
addSpecificHealers().catch(console.error);