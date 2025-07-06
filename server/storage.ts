import { users, type User, type InsertUser, auraReadings, type AuraReading, type InsertAuraReading, journals, type Journal, type InsertJournal, numerologyReadings, type NumerologyReading, type InsertNumerologyReading, objectAnalyses, type ObjectAnalysis, type InsertObjectAnalysis, healers, type Healer, type InsertHealer, healerBookings, type HealerBooking, type InsertHealerBooking } from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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
  createUser(user: InsertUser): Promise<User>;
  
  // Aura readings
  saveAuraReading(reading: InsertAuraReading): Promise<AuraReading>;
  getAuraReadingsByUser(userId: number): Promise<AuraReading[]>;
  getAuraReading(id: number): Promise<AuraReading | undefined>;
  updateAuraReadingReview(id: number, rating: number, reviewText?: string): Promise<AuraReading | undefined>;
  
  // Journal entries
  createJournalEntry(entry: InsertJournal): Promise<Journal>;
  getJournalEntriesByUser(userId: number): Promise<Journal[]>;
  getJournalEntry(id: number): Promise<Journal | undefined>;
  
  // Numerology readings
  saveNumerologyReading(reading: InsertNumerologyReading): Promise<NumerologyReading>;
  getNumerologyReadingsByUser(userId: number): Promise<NumerologyReading[]>;
  getNumerologyReading(id: number): Promise<NumerologyReading | undefined>;
  
  // Object analyses
  saveObjectAnalysis(analysis: InsertObjectAnalysis): Promise<ObjectAnalysis>;
  getObjectAnalysesByUser(userId: number): Promise<ObjectAnalysis[]>;
  getObjectAnalysis(id: number): Promise<ObjectAnalysis | undefined>;
  updateObjectAnalysisReview(id: number, rating: number, reviewText?: string): Promise<ObjectAnalysis | undefined>;
  
  // Healer management
  getAllHealers(): Promise<Healer[]>;
  getHealer(id: number): Promise<Healer | undefined>;
  createHealer(healer: InsertHealer): Promise<Healer>;
  
  // Healer bookings
  createHealerBooking(booking: InsertHealerBooking): Promise<HealerBooking>;
  getHealerBookingsByUser(userId: number): Promise<HealerBooking[]>;
  getHealerBookingsByHealer(healerId: number): Promise<HealerBooking[]>;
  updateBookingStatus(bookingId: number, status: string): Promise<HealerBooking | undefined>;
  
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        userType: insertUser.userType || "client"
      })
      .returning();
    return user;
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

  async getAuraReadingsByUser(userId: number): Promise<AuraReading[]> {
    return await db.select().from(auraReadings).where(eq(auraReadings.userId, userId));
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

  async getNumerologyReading(id: number): Promise<NumerologyReading | undefined> {
    const [reading] = await db.select().from(numerologyReadings).where(eq(numerologyReadings.id, id));
    return reading || undefined;
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

  async updateBookingStatus(bookingId: number, status: string): Promise<HealerBooking | undefined> {
    const [updatedBooking] = await db
      .update(healerBookings)
      .set({ status })
      .where(eq(healerBookings.id, bookingId))
      .returning();
    return updatedBooking;
  }
}

export const storage = new DatabaseStorage();