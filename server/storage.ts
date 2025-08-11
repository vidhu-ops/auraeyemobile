import { users, type User, type InsertUser, auraReadings, type AuraReading, type InsertAuraReading, journals, type Journal, type InsertJournal, numerologyReadings, type NumerologyReading, type InsertNumerologyReading, objectAnalyses, type ObjectAnalysis, type InsertObjectAnalysis, healers, type Healer, type InsertHealer, healerBookings, type HealerBooking, type InsertHealerBooking, vibeFeedback, type VibeFeedback, type InsertVibeFeedback, creditTransactions, type CreditTransaction, type InsertCreditTransaction, passwordResetTokens, type PasswordResetToken, type InsertPasswordResetToken } from "../shared/schema";
import { db } from "./db";
import { eq, and, gt, desc } from "drizzle-orm";
import createMemoryStore from "memorystore";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Create appropriate session store based on environment
const createSessionStore = () => {
  if (process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
    const PostgreSQLStore = connectPg(session);
    return new PostgreSQLStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    });
  } else {
    const MemoryStore = createMemoryStore(session);
    return new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }
};

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMobileNumber(mobileNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<User | undefined>;
  
  // Credit costs based on user type
  getCreditCost(userId: number, serviceType: string): Promise<number>;
  
  // Aura readings
  saveAuraReading(reading: InsertAuraReading): Promise<AuraReading>;
  findAuraReadingByImageHash(imageHash: string): Promise<AuraReading | undefined>;
  getAuraReadingsByUser(userId: number): Promise<AuraReading[]>;
  getAuraReading(id: number): Promise<AuraReading | undefined>;
  updateAuraReadingReview(id: number, rating: number, reviewText?: string): Promise<AuraReading | undefined>;
  updateAuraReadingNotes(id: number, healerNotes: string): Promise<AuraReading | undefined>;
  
  // Journal entries
  createJournalEntry(entry: InsertJournal): Promise<Journal>;
  getJournalEntriesByUser(userId: number): Promise<Journal[]>;
  getJournalEntry(id: number): Promise<Journal | undefined>;
  
  // Numerology readings
  saveNumerologyReading(reading: InsertNumerologyReading): Promise<NumerologyReading>;
  getNumerologyReadingsByUser(userId: number): Promise<NumerologyReading[]>;
  getNumerologyReading(id: number): Promise<NumerologyReading | undefined>;
  updateNumerologyReadingNotes(id: number, healerNotes: string): Promise<NumerologyReading | undefined>;
  
  // Object analyses
  saveObjectAnalysis(analysis: InsertObjectAnalysis): Promise<ObjectAnalysis>;
  getObjectAnalysesByUser(userId: number): Promise<ObjectAnalysis[]>;
  getObjectAnalysis(id: number): Promise<ObjectAnalysis | undefined>;
  updateObjectAnalysisReview(id: number, rating: number, reviewText?: string): Promise<ObjectAnalysis | undefined>;
  
  // Healer management
  getAllHealers(): Promise<Healer[]>;
  getHealer(id: number): Promise<Healer | undefined>;
  getHealerByUsername(username: string): Promise<Healer | undefined>;
  createHealer(healer: InsertHealer): Promise<Healer>;
  
  // Healer bookings
  createHealerBooking(booking: InsertHealerBooking): Promise<HealerBooking>;
  getHealerBookingsByUser(userId: number): Promise<HealerBooking[]>;
  getHealerBookingsByHealer(healerId: number): Promise<HealerBooking[]>;
  getHealerBooking(bookingId: number): Promise<HealerBooking | undefined>;
  updateBookingStatus(bookingId: number, status: string): Promise<HealerBooking | undefined>;
  updateBookingStatusWithResponse(bookingId: number, status: string, healerResponse?: string): Promise<HealerBooking | undefined>;
  
  // Healer analytics
  getHealerClientStats(healerId: number): Promise<any>;
  getHealerBookingTrends(healerId: number): Promise<any>;
  
  // Vibe feedback
  saveVibeFeedback(feedback: InsertVibeFeedback): Promise<VibeFeedback>;
  getVibeFeedbackByUser(userId: number): Promise<VibeFeedback[]>;
  
  // Credit management
  getUserCredits(userId: number): Promise<number>;
  deductCredits(userId: number, amount: number, type: string, description: string): Promise<boolean>;
  addCredits(userId: number, amount: number, type: string, description: string): Promise<boolean>;
  getCreditTransactionsByUser(userId: number): Promise<CreditTransaction[]>;
  createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  
  // Password reset tokens
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  validatePasswordResetToken(email: string, token: string): Promise<PasswordResetToken | undefined>;
  validatePasswordResetTokenByMobile(mobileNumber: string, token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(tokenId: number): Promise<void>;

  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = createSessionStore();
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByMobileNumber(mobileNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.mobileNumber, mobileNumber));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Set credits based on user type: clients get 30, healers get 100
    const userType = insertUser.userType || "client";
    const isHealer = userType === 'healer';
    const initialCredits = isHealer ? 100 : 30;
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        userType,
        credits: insertUser.credits || initialCredits
      })
      .returning();
    
    // Log the initial credit grant
    await this.createCreditTransaction({
      userId: user.id,
      amount: initialCredits,
      transactionType: "registration",
      description: `Welcome bonus - ${initialCredits} free credits (${isHealer ? 'healer' : 'client'} account)`,
      balanceAfter: initialCredits,
    });
    
    return user;
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Aura readings
  async saveAuraReading(reading: InsertAuraReading): Promise<AuraReading> {
    const [auraReading] = await db
      .insert(auraReadings)
      .values({
        ...reading,
        secondaryColor: reading.secondaryColor || null
      })
      .returning();
    return auraReading;
  }

  async findAuraReadingByImageHash(imageHash: string): Promise<AuraReading | undefined> {
    // Look for existing analysis with the same image hash
    const [reading] = await db
      .select()
      .from(auraReadings)
      .where(eq(auraReadings.imageUrl, imageHash))
      .limit(1);
    return reading;
  }

  async getAuraReadingsByUser(userId: number): Promise<AuraReading[]> {
    return await db.select().from(auraReadings).where(eq(auraReadings.userId, userId));
  }

  async getAuraReadingsByPerformedBy(performedBy: number, limit: number = 50): Promise<AuraReading[]> {
    return await db.select().from(auraReadings)
      .where(eq(auraReadings.performedBy, performedBy))
      .orderBy(desc(auraReadings.createdAt))
      .limit(limit);
  }

  async getAuraReading(id: number): Promise<AuraReading | undefined> {
    const [reading] = await db.select().from(auraReadings).where(eq(auraReadings.id, id));
    return reading || undefined;
  }

  async updateAuraReadingReview(id: number, rating: number, reviewText?: string): Promise<AuraReading | undefined> {
    const [updatedReading] = await db
      .update(auraReadings)
      .set({ rating, reviewText })
      .where(eq(auraReadings.id, id))
      .returning();
    return updatedReading || undefined;
  }

  async updateAuraReadingNotes(id: number, healerNotes: string): Promise<AuraReading | undefined> {
    const [updatedReading] = await db
      .update(auraReadings)
      .set({ healerNotes })
      .where(eq(auraReadings.id, id))
      .returning();
    return updatedReading || undefined;
  }

  // Journal entries
  async createJournalEntry(entry: InsertJournal): Promise<Journal> {
    const [journalEntry] = await db
      .insert(journals)
      .values(entry)
      .returning();
    return journalEntry;
  }

  async getJournalEntriesByUser(userId: number): Promise<Journal[]> {
    return await db.select().from(journals).where(eq(journals.userId, userId));
  }

  async getJournalEntry(id: number): Promise<Journal | undefined> {
    const [entry] = await db.select().from(journals).where(eq(journals.id, id));
    return entry || undefined;
  }

  // Numerology readings
  async saveNumerologyReading(reading: InsertNumerologyReading): Promise<NumerologyReading> {
    const [numerologyReading] = await db
      .insert(numerologyReadings)
      .values(reading)
      .returning();
    return numerologyReading;
  }

  async getNumerologyReadingsByUser(userId: number): Promise<NumerologyReading[]> {
    return await db.select().from(numerologyReadings).where(eq(numerologyReadings.userId, userId));
  }

  async getNumerologyReadingsByPerformedBy(performedBy: number): Promise<NumerologyReading[]> {
    return await db.select().from(numerologyReadings).where(eq(numerologyReadings.performedBy, performedBy)).orderBy(desc(numerologyReadings.createdAt));
  }

  async getNumerologyReading(id: number): Promise<NumerologyReading | undefined> {
    const [reading] = await db.select().from(numerologyReadings).where(eq(numerologyReadings.id, id));
    return reading || undefined;
  }

  async updateNumerologyReadingNotes(id: number, healerNotes: string): Promise<NumerologyReading | undefined> {
    const [updatedReading] = await db
      .update(numerologyReadings)
      .set({ healerNotes })
      .where(eq(numerologyReadings.id, id))
      .returning();
    return updatedReading || undefined;
  }

  // Object analyses
  async saveObjectAnalysis(analysis: InsertObjectAnalysis): Promise<ObjectAnalysis> {
    const [objectAnalysis] = await db
      .insert(objectAnalyses)
      .values(analysis)
      .returning();
    return objectAnalysis;
  }

  async getObjectAnalysesByUser(userId: number): Promise<ObjectAnalysis[]> {
    return await db.select().from(objectAnalyses).where(eq(objectAnalyses.userId, userId));
  }

  async getObjectAnalysis(id: number): Promise<ObjectAnalysis | undefined> {
    const [analysis] = await db.select().from(objectAnalyses).where(eq(objectAnalyses.id, id));
    return analysis || undefined;
  }

  async updateObjectAnalysisReview(id: number, rating: number, reviewText?: string): Promise<ObjectAnalysis | undefined> {
    const [updatedAnalysis] = await db
      .update(objectAnalyses)
      .set({ rating, reviewText })
      .where(eq(objectAnalyses.id, id))
      .returning();
    return updatedAnalysis || undefined;
  }

  // Healer management
  async getAllHealers(): Promise<Healer[]> {
    return await db.select().from(healers);
  }

  async getHealer(id: number): Promise<Healer | undefined> {
    const [healer] = await db.select().from(healers).where(eq(healers.id, id));
    return healer || undefined;
  }

  async getHealerByUsername(username: string): Promise<Healer | undefined> {
    const [healer] = await db.select().from(healers).where(eq(healers.username, username));
    return healer || undefined;
  }

  async createHealer(healer: InsertHealer): Promise<Healer> {
    const [newHealer] = await db
      .insert(healers)
      .values(healer)
      .returning();
    return newHealer;
  }

  // Healer bookings
  async createHealerBooking(booking: InsertHealerBooking): Promise<HealerBooking> {
    const [newBooking] = await db
      .insert(healerBookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async getHealerBookingsByUser(userId: number): Promise<HealerBooking[]> {
    return await db.select().from(healerBookings).where(eq(healerBookings.userId, userId));
  }

  async getHealerBookingsByHealer(healerId: number): Promise<HealerBooking[]> {
    return await db.select().from(healerBookings).where(eq(healerBookings.healerId, healerId));
  }

  async getHealerBooking(bookingId: number): Promise<HealerBooking | undefined> {
    const [booking] = await db.select().from(healerBookings).where(eq(healerBookings.id, bookingId));
    return booking;
  }

  async updateBookingStatus(bookingId: number, status: string): Promise<HealerBooking | undefined> {
    const [updatedBooking] = await db
      .update(healerBookings)
      .set({ status })
      .where(eq(healerBookings.id, bookingId))
      .returning();
    return updatedBooking;
  }

  async updateBookingStatusWithResponse(bookingId: number, status: string, healerResponse?: string): Promise<HealerBooking | undefined> {
    const [updatedBooking] = await db
      .update(healerBookings)
      .set({ 
        status, 
        healerResponse,
        respondedAt: new Date()
      })
      .where(eq(healerBookings.id, bookingId))
      .returning();
    return updatedBooking;
  }

  async getHealerClientStats(healerId: number): Promise<any> {
    const bookings = await db
      .select()
      .from(healerBookings)
      .where(eq(healerBookings.healerId, healerId));
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentBookings = bookings.filter(b => new Date(b.createdAt) >= thirtyDaysAgo);
    const acceptedBookings = bookings.filter(b => b.status === 'accepted');
    const rejectedBookings = bookings.filter(b => b.status === 'rejected');
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    
    // Get unique clients
    const uniqueClients = Array.from(new Set(bookings.map(b => b.userId)));
    
    // Calculate total credits generated (1 credit per booking)
    const totalCreditsGenerated = bookings.length;
    const recentCreditsGenerated = recentBookings.length;
    
    return {
      totalBookings: bookings.length,
      recentBookings: recentBookings.length,
      acceptedBookings: acceptedBookings.length,
      rejectedBookings: rejectedBookings.length,
      pendingBookings: pendingBookings.length,
      totalClients: uniqueClients.length,
      acceptanceRate: bookings.length > 0 ? (acceptedBookings.length / bookings.length) * 100 : 0,
      totalCreditsGenerated,
      recentCreditsGenerated
    };
  }

  async getHealerBookingTrends(healerId: number): Promise<any> {
    const bookings = await db
      .select()
      .from(healerBookings)
      .where(eq(healerBookings.healerId, healerId));
    
    const now = new Date();
    const trends = [];
    
    // Get last 7 days of booking data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate >= dayStart && bookingDate < dayEnd;
      });
      
      trends.push({
        date: date.toISOString().split('T')[0],
        bookings: dayBookings.length,
        accepted: dayBookings.filter(b => b.status === 'accepted').length,
        rejected: dayBookings.filter(b => b.status === 'rejected').length,
        pending: dayBookings.filter(b => b.status === 'pending').length
      });
    }
    
    return trends;
  }

  // Vibe feedback methods
  async saveVibeFeedback(feedback: InsertVibeFeedback): Promise<VibeFeedback> {
    const [vibeFeedbackResult] = await db
      .insert(vibeFeedback)
      .values(feedback)
      .returning();
    return vibeFeedbackResult;
  }

  async getVibeFeedbackByUser(userId: number): Promise<VibeFeedback[]> {
    return await db
      .select()
      .from(vibeFeedback)
      .where(eq(vibeFeedback.userId, userId));
  }

  // Credit management methods
  async getUserCredits(userId: number): Promise<number> {
    if (!userId || typeof userId !== 'number') {
      throw new Error('Invalid userId provided for credit check');
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error('User not found for credit check');
    }
    
    return user.credits || 0;
  }

  async deductCredits(userId: number, amount: number, type: string, description: string): Promise<boolean> {
    if (!userId || typeof userId !== 'number') {
      throw new Error('Invalid userId provided for credit deduction');
    }
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount for credit deduction');
    }
    
    const currentCredits = await this.getUserCredits(userId);
    if (currentCredits < amount) {
      return false; // Insufficient credits
    }
    
    const newBalance = currentCredits - amount;
    
    // Ensure balance doesn't go negative
    if (newBalance < 0) {
      return false;
    }
    
    // Update user credits atomically
    await db.update(users).set({ credits: newBalance }).where(eq(users.id, userId));
    
    // Log transaction
    await this.createCreditTransaction({
      userId,
      amount: -amount,
      transactionType: type,
      description,
      balanceAfter: newBalance,
    });
    
    return true;
  }

  async addCredits(userId: number, amount: number, type: string, description: string): Promise<boolean> {
    if (!userId || typeof userId !== 'number') {
      throw new Error('Invalid userId provided for credit addition');
    }
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount for credit addition');
    }
    
    const currentCredits = await this.getUserCredits(userId);
    const newBalance = currentCredits + amount;
    
    // Update user credits atomically
    await db.update(users).set({ credits: newBalance }).where(eq(users.id, userId));
    
    // Log transaction
    await this.createCreditTransaction({
      userId,
      amount,
      transactionType: type,
      description,
      balanceAfter: newBalance,
    });
    
    return true;
  }

  async getCreditTransactionsByUser(userId: number): Promise<CreditTransaction[]> {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(creditTransactions.createdAt);
  }

  async createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const [creditTransaction] = await db
      .insert(creditTransactions)
      .values(transaction)
      .returning();
    return creditTransaction;
  }

  // Get credit cost based on user type and service
  async getCreditCost(userId: number, serviceType: string): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found for credit cost calculation');
    }
    
    const isHealer = user.userType === 'healer';
    
    // Define credit costs for different service types
    const creditCosts = {
      // Client costs
      client: {
        'vibe_check': 1,
        'object_analysis': 3,
        'aura_analysis': 15,
        'healer_booking': 3,
        'numerology': 5,
      },
      // Healer costs (subscription-based lower rates)
      healer: {
        'vibe_check': 1,
        'object_analysis': 1,
        'aura_analysis': 5,
        'healer_booking': 1,
        'numerology': 3,
      }
    };
    
    const userTypeCosts = isHealer ? creditCosts.healer : creditCosts.client;
    return userTypeCosts[serviceType as keyof typeof userTypeCosts] || 1;
  }

  // Password reset tokens
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [resetToken] = await db
      .insert(passwordResetTokens)
      .values(token)
      .returning();
    return resetToken;
  }

  async validatePasswordResetToken(email: string, token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.email, email),
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      );
    return resetToken || undefined;
  }

  async validatePasswordResetTokenByMobile(mobileNumber: string, token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.mobileNumber, mobileNumber),
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      );
    return resetToken || undefined;
  }

  async markPasswordResetTokenAsUsed(tokenId: number): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenId));
  }
}

export const storage = new DatabaseStorage();