import { db } from "../db";
import { users, creditTransactions } from "../../shared/schema";
import { eq, and, gte } from "drizzle-orm";

export async function fixHealerCreditTransactions() {
  try {
    console.log('Fixing credit transactions for newly created healers...');
    
    // Get all healers created today (they should have 150 credits but no transactions)
    const healers = await db.select()
      .from(users)
      .where(and(
        eq(users.userType, 'healer'),
        eq(users.credits, 150)
      ));
    
    console.log(`Found ${healers.length} healers with 150 credits`);
    
    let fixed = 0;
    
    for (const healer of healers) {
      // Check if this healer already has credit transactions
      const existingTransactions = await db.select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, healer.id));
      
      if (existingTransactions.length === 0) {
        // Create initial credit transaction record
        await db.insert(creditTransactions).values({
          userId: healer.id,
          username: healer.username,
          amount: 150,
          transactionType: "registration",
          description: `Welcome bonus - 150 free credits (healer account)`,
          balanceAfter: 150,
        });
        
        console.log(`✓ Added credit transaction for healer: ${healer.username}`);
        fixed++;
      } else {
        console.log(`- Healer ${healer.username} already has ${existingTransactions.length} transaction(s)`);
      }
    }
    
    console.log(`\n✅ Credit transaction fix completed:`);
    console.log(`   Fixed: ${fixed} healers`);
    console.log(`   Already had transactions: ${healers.length - fixed} healers`);
    
  } catch (error) {
    console.error('Credit transaction fix failed:', error);
    throw error;
  }
}

// Execute immediately
fixHealerCreditTransactions()
  .then(() => {
    console.log('Credit transaction fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Credit transaction fix failed:', error);
    process.exit(1);
  });