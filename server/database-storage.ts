import { users, type User, type InsertUser, auraReadings, type AuraReading, type InsertAuraReading, journals, type Journal, type InsertJournal, numerologyReadings, type NumerologyReading, type InsertNumerologyReading, healers, type Healer, type InsertHealer, healerBookings, type HealerBooking, type InsertHealerBooking } from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import createMemoryStore from "memorystore";
import session from "express-session";
import type { IStorage } from "./storage";

// Create memory store for sessions
const MemoryStore = createMemoryStore(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
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
}