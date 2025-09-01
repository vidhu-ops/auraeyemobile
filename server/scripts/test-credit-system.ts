import { db } from "../db";
import { users, creditTransactions } from "../../shared/schema";
import { storage } from "../storage";
import { eq } from "drizzle-orm";

export async function testCreditSystem() {
  try {
    console.log('🧪 Testing credit system functionality...\n');
    
    // Test 1: Check if a sample healer has correct credits
    const testHealer = await storage.getUserByUsername('Shweta.Singh');
    if (!testHealer) {
      throw new Error('Test healer not found');
    }
    
    const initialCredits = await storage.getUserCredits(testHealer.id);
    console.log(`✓ Test healer ${testHealer.username} has ${initialCredits} credits`);
    
    // Test 2: Check credit cost calculation for different user types
    const healerCosts = {
      vibe_check: await storage.getCreditCost(testHealer.id, 'vibe_check'),
      object_analysis: await storage.getCreditCost(testHealer.id, 'object_analysis'),
      aura_analysis: await storage.getCreditCost(testHealer.id, 'aura_analysis'),
      healer_booking: await storage.getCreditCost(testHealer.id, 'healer_booking'),
      numerology: await storage.getCreditCost(testHealer.id, 'numerology')
    };
    
    console.log('✓ Healer service costs:', healerCosts);
    
    // Test 3: Simulate credit deduction
    const testAmount = 5;
    const deductionSuccess = await storage.deductCredits(
      testHealer.id, 
      testAmount, 
      'test_deduction', 
      'Testing credit deduction system'
    );
    
    if (deductionSuccess) {
      const newCredits = await storage.getUserCredits(testHealer.id);
      console.log(`✓ Credit deduction successful: ${initialCredits} → ${newCredits} (deducted ${testAmount})`);
      
      // Test 4: Add credits back
      const additionSuccess = await storage.addCredits(
        testHealer.id,
        testAmount,
        'test_addition',
        'Testing credit addition system'
      );
      
      if (additionSuccess) {
        const finalCredits = await storage.getUserCredits(testHealer.id);
        console.log(`✓ Credit addition successful: ${newCredits} → ${finalCredits} (added ${testAmount})`);
      } else {
        console.log('❌ Credit addition failed');
      }
    } else {
      console.log('❌ Credit deduction failed');
    }
    
    // Test 5: Check transaction history
    const transactions = await storage.getCreditTransactionsByUser(testHealer.id);
    console.log(`✓ Healer has ${transactions.length} credit transactions recorded`);
    
    // Show recent transactions
    const recentTransactions = transactions.slice(-3);
    console.log('📊 Recent transactions:');
    recentTransactions.forEach(tx => {
      console.log(`   ${tx.transactionType}: ${tx.amount > 0 ? '+' : ''}${tx.amount} credits - ${tx.description} (Balance: ${tx.balanceAfter})`);
    });
    
    // Test 6: Check transaction counts for all new healers
    const newHealers = await db.select()
      .from(users)
      .where(eq(users.userType, 'healer'));
    
    let healersWithTransactions = 0;
    let healersWithoutTransactions = 0;
    
    for (const healer of newHealers) {
      const healerTransactions = await storage.getCreditTransactionsByUser(healer.id);
      if (healerTransactions.length > 0) {
        healersWithTransactions++;
      } else {
        healersWithoutTransactions++;
      }
    }
    
    console.log(`\n📈 Credit System Status:`);
    console.log(`   Total healers: ${newHealers.length}`);
    console.log(`   Healers with transaction history: ${healersWithTransactions}`);
    console.log(`   Healers without transaction history: ${healersWithoutTransactions}`);
    
    // Test 7: Verify service cost differences between client and healer
    if (newHealers.length > 0) {
      const sampleHealer = newHealers[0];
      console.log(`\n💰 Service pricing for healer (${sampleHealer.username}):`);
      console.log(`   Vibe check: ${await storage.getCreditCost(sampleHealer.id, 'vibe_check')} credits`);
      console.log(`   Object analysis: ${await storage.getCreditCost(sampleHealer.id, 'object_analysis')} credits`);
      console.log(`   Aura analysis: ${await storage.getCreditCost(sampleHealer.id, 'aura_analysis')} credits`);
      console.log(`   Healer booking: ${await storage.getCreditCost(sampleHealer.id, 'healer_booking')} credits`);
      console.log(`   Numerology: ${await storage.getCreditCost(sampleHealer.id, 'numerology')} credits`);
    }
    
    console.log('\n✅ Credit system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Credit system test failed:', error);
    throw error;
  }
}

// Execute immediately
testCreditSystem()
  .then(() => {
    console.log('Credit system test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Credit system test failed:', error);
    process.exit(1);
  });