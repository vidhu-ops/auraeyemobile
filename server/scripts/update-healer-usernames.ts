import { db } from "../db";
import { users, healers } from "@shared/schema";
import { eq } from "drizzle-orm";

async function updateHealerUsernames() {
  console.log("🔄 Updating healer usernames with Dr prefix...");

  const updates = [
    { oldUsername: "VaishaliRathi", newUsername: "DrVaishaliRathi" },
    { oldUsername: "Shradha.Sharma", newUsername: "DrShradha.Sharma" }
  ];

  for (const update of updates) {
    try {
      // Check if the user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, update.oldUsername));

      if (!existingUser) {
        console.log(`❌ User ${update.oldUsername} not found`);
        continue;
      }

      // Update username in users table
      await db
        .update(users)
        .set({ username: update.newUsername })
        .where(eq(users.username, update.oldUsername));

      console.log(`✅ Updated users table: ${update.oldUsername} → ${update.newUsername}`);

      // Update username in healers table (if exists)
      const [existingHealer] = await db
        .select()
        .from(healers)
        .where(eq(healers.username, update.oldUsername));

      if (existingHealer) {
        await db
          .update(healers)
          .set({ username: update.newUsername })
          .where(eq(healers.username, update.oldUsername));

        console.log(`✅ Updated healers table: ${update.oldUsername} → ${update.newUsername}`);
      } else {
        console.log(`ℹ️ No healer profile found for ${update.oldUsername}`);
      }

    } catch (error) {
      console.error(`❌ Error updating ${update.oldUsername}:`, error);
    }
  }

  console.log("🎉 Username updates completed!");
}

// Run the script
updateHealerUsernames().catch(console.error);