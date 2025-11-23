import { users, type User, type InsertUser, auraReadings, type AuraReading, type InsertAuraReading, journals, type Journal, type InsertJournal, numerologyReadings, type NumerologyReading, type InsertNumerologyReading, objectAnalyses, type ObjectAnalysis, type InsertObjectAnalysis, healers, type Healer, type InsertHealer, healerBookings, type HealerBooking, type InsertHealerBooking, vibeFeedback, type VibeFeedback, type InsertVibeFeedback, vibeReadings, type VibeReading, type InsertVibeReading, creditTransactions, type CreditTransaction, type InsertCreditTransaction, passwordResetTokens, type PasswordResetToken, type InsertPasswordResetToken, pdfStorage, type PdfStorage, type InsertPdfStorage, moodSnapshots, type MoodSnapshot, type InsertMoodSnapshot, pushSubscriptions, type PushSubscription, type InsertPushSubscription, meditationSessions, type MeditationSession, type InsertMeditationSession } from "../shared/schema";
import { db } from "./db";
import { eq, and, gt, desc, or, gte, lt } from "drizzle-orm";
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
  updateUserOnboarding(userId: number, onboarding: { manifestIntention: string; energyLevel: string; biggestBlock: string }): Promise<User | undefined>;
  updateNotificationPreferences(userId: number, preferences: { smsEnabled?: boolean; phoneNumber?: string; browserEnabled?: boolean; emailEnabled?: boolean }): Promise<User | undefined>;
  updateProfilePicture(userId: number, pictureUrl: string): Promise<User | undefined>;
  updateUserCredits(userId: number, newCredits: number): Promise<User | undefined>;
  updateUserEmail(userId: number, newEmail: string): Promise<User | undefined>;
  
  // Push notification subscriptions
  savePushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscriptionsByUser(userId: number): Promise<PushSubscription[]>;
  getAllPushSubscriptions(): Promise<PushSubscription[]>;
  deletePushSubscription(endpoint: string): Promise<boolean>;
  
  // Credit costs based on user type
  getCreditCost(userId: number, serviceType: string): Promise<number>;
  
  // Aura readings
  saveAuraReading(reading: InsertAuraReading): Promise<AuraReading>;
  findAuraReadingByImageHash(imageHash: string): Promise<AuraReading | undefined>;
  getAuraReadingsByUser(userId: number): Promise<AuraReading[]>;
  getAuraReading(id: number): Promise<AuraReading | undefined>;
  updateAuraReadingReview(id: number, rating: number, reviewText?: string): Promise<AuraReading | undefined>;
  updateAuraReadingNotes(id: number, healerNotes: string): Promise<AuraReading | undefined>;
  updateAuraReadingImage(id: number, processedImage: string): Promise<boolean>;
  
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
  updateHealerPassword(username: string, hashedPassword: string): Promise<Healer | undefined>;
  
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
  
  // Vibe readings for healer dashboard
  saveVibeReading(reading: InsertVibeReading): Promise<VibeReading>;
  getVibeReadingsByUserId(userId: number): Promise<VibeReading[]>;
  getAllVibeReadings(): Promise<any[]>;
  
  // Credit management
  getUserCredits(userId: number): Promise<number>;
  deductCredits(userId: number, amount: number, type: string, description: string): Promise<boolean>;
  addCredits(userId: number, amount: number, type: string, description: string): Promise<boolean>;
  getCreditTransactionsByUser(userId: number): Promise<CreditTransaction[]>;
  createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  
  // Soul energy management
  getUserSoulEnergy(userId: number): Promise<number>;
  addSoulEnergy(userId: number, amount: number, source: string): Promise<boolean>;
  
  // Password reset tokens
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  validatePasswordResetToken(email: string, token: string): Promise<PasswordResetToken | undefined>;
  validatePasswordResetTokenByMobile(mobileNumber: string, token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(tokenId: number): Promise<void>;

  // PDF storage for exact PDF retrieval
  storePdf(pdfStorage: InsertPdfStorage): Promise<PdfStorage>;
  getPdfByAuraReadingId(auraReadingId: number): Promise<PdfStorage | undefined>;
  getPdfsByHealerId(healerId: number): Promise<PdfStorage[]>;

  // Mood snapshots
  createMoodSnapshot(snapshot: InsertMoodSnapshot): Promise<MoodSnapshot>;
  getMoodSnapshotsByUser(userId: number): Promise<MoodSnapshot[]>;
  getRecentMoodSnapshots(userId: number, limit: number): Promise<MoodSnapshot[]>;

  // Meditation sessions
  createMeditationSession(session: InsertMeditationSession): Promise<MeditationSession>;
  getUserMeditationSessions(userId: number): Promise<MeditationSession[]>;
  getMeditationStats(userId: number): Promise<{ sessionsCount: number; totalMinutes: number; totalEnergy: number }>;

  // User statistics
  getUserStats(userId: number): Promise<any>;

  // Login streak tracking
  recordLogin(userId: number): Promise<void>;
  getLoginStreak(userId: number): Promise<{ currentStreak: number; longestStreak: number; weeklyActiveDates: string[] }>;

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
    // Set credits based on user type: clients get 0 (then 5 from onboarding), healers get 100
    // SECURITY: Always ignore user-supplied credits to prevent privilege escalation
    const userType = insertUser.userType || "client";
    const isHealer = userType === 'healer';
    const initialCredits = isHealer ? 100 : 0;
    
    // Use database transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          ...insertUser,
          userType,
          credits: initialCredits // Always use role-based credits, ignore user input
        })
        .returning();
      
      // Log the initial credit grant in same transaction
      await tx.insert(creditTransactions).values({
        userId: user.id,
        username: user.username,
        amount: initialCredits,
        transactionType: "registration",
        description: `Welcome bonus - ${initialCredits} free credits (${isHealer ? 'healer' : 'client'} account)`,
        balanceAfter: initialCredits,
      });
      
      return user;
    });
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async updateUserOnboarding(userId: number, onboarding: { manifestIntention: string; energyLevel: string; biggestBlock: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        manifestIntention: onboarding.manifestIntention,
        energyLevel: onboarding.energyLevel,
        biggestBlock: onboarding.biggestBlock
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async updateNotificationPreferences(userId: number, preferences: { smsEnabled?: boolean; phoneNumber?: string; browserEnabled?: boolean; emailEnabled?: boolean }): Promise<User | undefined> {
    const updateData: any = {};
    
    if (preferences.smsEnabled !== undefined) {
      updateData.smsNotificationsEnabled = preferences.smsEnabled;
    }
    if (preferences.phoneNumber !== undefined) {
      updateData.mobileNumber = preferences.phoneNumber;
    }
    if (preferences.browserEnabled !== undefined) {
      updateData.browserNotificationsEnabled = preferences.browserEnabled;
    }
    if (preferences.emailEnabled !== undefined) {
      updateData.emailNotificationsEnabled = preferences.emailEnabled;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async updateProfilePicture(userId: number, pictureUrl: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ profilePictureUrl: pictureUrl })
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

  async updateAuraReadingImage(id: number, processedImage: string): Promise<boolean> {
    try {
      const [updatedReading] = await db
        .update(auraReadings)
        .set({ processedAuraImage: processedImage })
        .where(eq(auraReadings.id, id))
        .returning();
      return !!updatedReading;
    } catch (error) {
      console.error("Error updating aura reading image:", error);
      return false;
    }
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

  async updateHealerPassword(username: string, hashedPassword: string): Promise<Healer | undefined> {
    const [healer] = await db
      .update(healers)
      .set({ password: hashedPassword })
      .where(eq(healers.username, username))
      .returning();
    return healer || undefined;
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

  // Vibe reading methods for healer dashboard
  async saveVibeReading(reading: InsertVibeReading): Promise<VibeReading> {
    const [vibeReading] = await db
      .insert(vibeReadings)
      .values(reading)
      .returning();
    return vibeReading;
  }

  async getVibeReadingsByUserId(userId: number): Promise<VibeReading[]> {
    return await db
      .select()
      .from(vibeReadings)
      .where(eq(vibeReadings.userId, userId))
      .orderBy(desc(vibeReadings.createdAt));
  }

  // Get all vibe readings (for healer dashboard - shows all vibe readings from all users)
  async getAllVibeReadings(): Promise<any[]> {
    const results = await db
      .select({
        id: vibeReadings.id,
        userId: vibeReadings.userId,
        personalityColor: vibeReadings.personalityColor,
        colorMeaning: vibeReadings.colorMeaning,
        uploadedImage: vibeReadings.uploadedImage,
        visualizedImage: vibeReadings.visualizedImage,
        sessionId: vibeReadings.sessionId,
        clientName: vibeReadings.clientName,
        fullAnalysis: vibeReadings.fullAnalysis,
        createdAt: vibeReadings.createdAt,
        username: users.username,
        userType: users.userType
      })
      .from(vibeReadings)
      .leftJoin(users, eq(vibeReadings.userId, users.id))
      .orderBy(desc(vibeReadings.createdAt));
    
    console.log(`🔍 Raw query returned ${results.length} vibe readings`);
    return results;
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
    
    // Use database transaction with row locking to prevent race conditions
    return await db.transaction(async (tx) => {
      // Lock the user row to prevent concurrent modifications
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .for('update');
      
      if (!user) {
        throw new Error('User not found for credit deduction');
      }
      
      const currentCredits = user.credits || 0;
      if (currentCredits < amount) {
        return false; // Insufficient credits
      }
      
      const newBalance = currentCredits - amount;
      
      // Ensure balance doesn't go negative
      if (newBalance < 0) {
        return false;
      }
      
      // Update user credits atomically
      await tx.update(users).set({ credits: newBalance }).where(eq(users.id, userId));
      
      // Log transaction in same atomic operation
      await tx.insert(creditTransactions).values({
        userId,
        username: user.username,
        amount: -amount,
        transactionType: type,
        description,
        balanceAfter: newBalance,
      });
      
      return true;
    });
  }

  async addCredits(userId: number, amount: number, type: string, description: string): Promise<boolean> {
    if (!userId || typeof userId !== 'number') {
      throw new Error('Invalid userId provided for credit addition');
    }
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount for credit addition');
    }
    
    // Use database transaction with row locking to prevent race conditions
    return await db.transaction(async (tx) => {
      // Lock the user row to prevent concurrent modifications
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .for('update');
      
      if (!user) {
        throw new Error('User not found for credit addition');
      }
      
      const currentCredits = user.credits || 0;
      const newBalance = currentCredits + amount;
      
      // Update user credits atomically
      await tx.update(users).set({ credits: newBalance }).where(eq(users.id, userId));
      
      // Log transaction in same atomic operation
      await tx.insert(creditTransactions).values({
        userId,
        username: user.username,
        amount,
        transactionType: type,
        description,
        balanceAfter: newBalance,
      });
      
      return true;
    });
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

  // Soul energy management methods
  async getUserSoulEnergy(userId: number): Promise<number> {
    if (!userId || typeof userId !== 'number') {
      throw new Error('Invalid userId provided for soul energy check');
    }
    
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        throw new Error('User not found for soul energy check');
      }
      
      // Defensive coding: return 0 if soulEnergy column doesn't exist or is null
      return (user as any).soulEnergy || 0;
    } catch (error) {
      // If the column doesn't exist yet, return 0 gracefully
      if (error instanceof Error && error.message.includes('column "soul_energy" does not exist')) {
        return 0;
      }
      throw error;
    }
  }

  async addSoulEnergy(userId: number, amount: number, source: string): Promise<boolean> {
    if (!userId || typeof userId !== 'number') {
      throw new Error('Invalid userId provided for soul energy addition');
    }
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount for soul energy addition');
    }
    
    try {
      // Use database transaction with row locking to prevent race conditions
      return await db.transaction(async (tx) => {
        // Lock the user row to prevent concurrent modifications
        const [user] = await tx
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .for('update');
        
        if (!user) {
          throw new Error('User not found for soul energy addition');
        }
        
        const currentSoulEnergy = (user as any).soulEnergy || 0;
        const newSoulEnergy = currentSoulEnergy + amount;
        
        // Update user soul energy atomically
        await tx.update(users).set({ soulEnergy: newSoulEnergy } as any).where(eq(users.id, userId));
        
        return true;
      });
    } catch (error) {
      // If the column doesn't exist yet, return true gracefully
      if (error instanceof Error && error.message.includes('column "soul_energy" does not exist')) {
        console.log(`Soul energy addition deferred: ${amount} for user ${userId} (${source}) - column not yet created`);
        return true;
      }
      throw error;
    }
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

  // PDF storage for exact PDF retrieval
  async storePdf(pdfStorageData: InsertPdfStorage): Promise<PdfStorage> {
    const [pdfRecord] = await db
      .insert(pdfStorage)
      .values(pdfStorageData)
      .returning();
    return pdfRecord;
  }

  async getPdfByAuraReadingId(auraReadingId: number): Promise<PdfStorage | undefined> {
    const [pdfRecord] = await db
      .select()
      .from(pdfStorage)
      .where(eq(pdfStorage.auraReadingId, auraReadingId));
    return pdfRecord || undefined;
  }

  async getPdfsByHealerId(healerId: number): Promise<PdfStorage[]> {
    return await db
      .select()
      .from(pdfStorage)
      .where(eq(pdfStorage.healerId, healerId))
      .orderBy(desc(pdfStorage.createdAt));
  }

  // Mood snapshots
  async createMoodSnapshot(snapshot: InsertMoodSnapshot): Promise<MoodSnapshot> {
    const [moodSnapshot] = await db
      .insert(moodSnapshots)
      .values(snapshot)
      .returning();
    return moodSnapshot;
  }

  async getMoodSnapshotsByUser(userId: number): Promise<MoodSnapshot[]> {
    return await db
      .select()
      .from(moodSnapshots)
      .where(eq(moodSnapshots.userId, userId))
      .orderBy(desc(moodSnapshots.timestamp));
  }

  async getRecentMoodSnapshots(userId: number, limit: number): Promise<MoodSnapshot[]> {
    return await db
      .select()
      .from(moodSnapshots)
      .where(eq(moodSnapshots.userId, userId))
      .orderBy(desc(moodSnapshots.timestamp))
      .limit(limit);
  }

  // Push notification subscriptions
  async savePushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    const [pushSub] = await db
      .insert(pushSubscriptions)
      .values(subscription)
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          keys: subscription.keys,
        }
      })
      .returning();
    return pushSub;
  }

  async getPushSubscriptionsByUser(userId: number): Promise<PushSubscription[]> {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    return await db
      .select()
      .from(pushSubscriptions);
  }

  async deletePushSubscription(endpoint: string): Promise<boolean> {
    const result = await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // User statistics
  async getUserStats(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) return null;

    // Get meditation hours from completed sessions
    const meditationStats = await this.getMeditationStats(userId);
    const meditationHours = Math.floor(meditationStats.totalMinutes / 60);

    // Get unique healers consulted (distinct healer IDs from bookings)
    const bookings = await db.select().from(healerBookings).where(eq(healerBookings.userId, userId));
    const uniqueHealerIds = new Set(bookings.map(b => b.healerId));
    const healersConsulted = uniqueHealerIds.size;

    // Get aura scans count (both received and performed by healers)
    const auraScansData = await db.select().from(auraReadings).where(
      or(
        eq(auraReadings.userId, userId),
        eq(auraReadings.performedBy, userId)
      )
    );
    const auraScans = auraScansData.length;

    // Get vibe scans count (userId already represents the healer who performed it)
    const vibeScansData = await db.select().from(vibeReadings).where(eq(vibeReadings.userId, userId));
    const vibeScans = vibeScansData.length;

    // Get numerology readings count (both received and performed by healers)
    const numerologyData = await db.select().from(numerologyReadings).where(
      or(
        eq(numerologyReadings.userId, userId),
        eq(numerologyReadings.performedBy, userId)
      )
    );
    const numerologyReadingsCount = numerologyData.length;

    // Get object scans count
    const objectScansData = await db.select().from(objectAnalyses).where(eq(objectAnalyses.userId, userId));
    const objectScans = objectScansData.length;

    // Get journal entries count
    const journalsData = await db.select().from(journals).where(eq(journals.userId, userId));
    const journalEntries = journalsData.length;

    // Calculate total sessions
    const totalSessions = auraScans + vibeScans + numerologyReadingsCount + objectScans;

    const stats: any = {
      meditationHours,
      healersConsulted,
      auraScans,
      vibeScans,
      numerologyReadings: numerologyReadingsCount,
      objectScans,
      totalSessions,
      journalEntries,
    };

    // Add healer-specific stats if user is a healer
    if (user.userType === 'healer') {
      // Get clients served (unique client IDs from aura readings performed by this healer)
      const healerReadings = await db.select().from(auraReadings).where(eq(auraReadings.performedBy, userId));
      const uniqueClientIds = new Set(healerReadings.map(r => r.userId));
      stats.clientsServed = uniqueClientIds.size;

      // Get sessions performed (total readings performed by this healer)
      stats.sessionsPerformed = healerReadings.length;
    }

    return stats;
  }

  // Meditation sessions
  async createMeditationSession(session: InsertMeditationSession): Promise<MeditationSession> {
    const [result] = await db.insert(meditationSessions).values(session).returning();
    return result;
  }

  async getUserMeditationSessions(userId: number): Promise<MeditationSession[]> {
    return db.select().from(meditationSessions)
      .where(eq(meditationSessions.userId, userId))
      .orderBy(desc(meditationSessions.createdAt));
  }

  async getMeditationStats(userId: number): Promise<{ sessionsCount: number; totalMinutes: number; totalEnergy: number }> {
    const sessions = await db.select().from(meditationSessions)
      .where(and(
        eq(meditationSessions.userId, userId),
        eq(meditationSessions.completed, true)
      ));
    
    const sessionsCount = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
    const totalEnergy = sessions.reduce((sum, session) => sum + (session.energyGained || 25), 0);
    
    return { sessionsCount, totalMinutes, totalEnergy };
  }

  // Record user login for streak tracking
  async recordLogin(userId: number): Promise<void> {
    try {
      const today = new Date();
      const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
      
      // Check if already logged in today
      const { loginSessions } = await import("../shared/schema");
      const existingToday = await db.select().from(loginSessions)
        .where(and(
          eq(loginSessions.userId, userId),
          gte(loginSessions.loginDate, todayStart),
          lt(loginSessions.loginDate, tomorrowStart)
        )).limit(1);
      
      // Only record if no login today
      if (existingToday.length === 0) {
        await db.insert(loginSessions).values({
          userId,
          loginDate: todayStart,
        });
        console.log(`✅ Login recorded for user ${userId}`);
      } else {
        console.log(`ℹ️ User ${userId} already logged in today`);
      }
    } catch (error) {
      console.error("Error recording login:", error);
      // Don't throw - let app continue even if login recording fails
    }
  }

  // Calculate login streaks and weekly active days
  async getLoginStreak(userId: number): Promise<{ currentStreak: number; longestStreak: number; weeklyActiveDates: string[] }> {
    const { loginSessions } = await import("../shared/schema");
    
    // Get all login dates sorted descending (most recent first)
    const logins = await db.select().from(loginSessions)
      .where(eq(loginSessions.userId, userId))
      .orderBy(desc(loginSessions.loginDate));
    
    if (logins.length === 0) {
      return { currentStreak: 0, longestStreak: 0, weeklyActiveDates: [] };
    }

    // Calculate current streak (consecutive days from today)
    let currentStreak = 0;
    const today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    let expectedDate = new Date(today);
    
    for (const login of logins) {
      const loginDate = new Date(login.loginDate);
      const dayDiff = Math.floor((expectedDate.getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 0) {
        currentStreak++;
        expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let maxStreak = 1;
    let currentStreakCount = 1;
    for (let i = 1; i < logins.length; i++) {
      const date1 = new Date(logins[i - 1].loginDate);
      const date2 = new Date(logins[i].loginDate);
      const dayDiff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        currentStreakCount++;
        maxStreak = Math.max(maxStreak, currentStreakCount);
      } else {
        currentStreakCount = 1;
      }
    }

    // Get weekly active dates (this week's logins)
    const weekStart = new Date(today);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    
    const weeklyDates = logins
      .filter(login => {
        const loginDate = new Date(login.loginDate);
        return loginDate >= weekStart;
      })
      .map(login => {
        const date = new Date(login.loginDate);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
      });

    return {
      currentStreak,
      longestStreak: maxStreak,
      weeklyActiveDates: weeklyDates
    };
  }

  async updateUserCredits(userId: number, newCredits: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ credits: newCredits })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async updateUserEmail(userId: number, newEmail: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ email: newEmail })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();