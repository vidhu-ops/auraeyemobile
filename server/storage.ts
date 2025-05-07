import { users, type User, type InsertUser, auraReadings, type AuraReading, type InsertAuraReading, journals, type Journal, type InsertJournal, numerologyReadings, type NumerologyReading, type InsertNumerologyReading } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Create memory store for sessions
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Aura readings
  saveAuraReading(reading: InsertAuraReading): Promise<AuraReading>;
  getAuraReadingsByUser(userId: number): Promise<AuraReading[]>;
  getAuraReading(id: number): Promise<AuraReading | undefined>;
  
  // Journal entries
  createJournalEntry(entry: InsertJournal): Promise<Journal>;
  getJournalEntriesByUser(userId: number): Promise<Journal[]>;
  getJournalEntry(id: number): Promise<Journal | undefined>;
  
  // Numerology readings
  saveNumerologyReading(reading: InsertNumerologyReading): Promise<NumerologyReading>;
  getNumerologyReadingsByUser(userId: number): Promise<NumerologyReading[]>;
  getNumerologyReading(id: number): Promise<NumerologyReading | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private auraReadings: Map<number, AuraReading>;
  private journals: Map<number, Journal>;
  private numerologyReadings: Map<number, NumerologyReading>;
  sessionStore: session.SessionStore;
  currentId: number;
  currentAuraId: number;
  currentJournalId: number;
  currentNumerologyId: number;

  constructor() {
    this.users = new Map();
    this.auraReadings = new Map();
    this.journals = new Map();
    this.numerologyReadings = new Map();
    this.currentId = 1;
    this.currentAuraId = 1;
    this.currentJournalId = 1;
    this.currentNumerologyId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours (prune expired entries)
    });
  }

  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  // Aura reading methods
  async saveAuraReading(reading: InsertAuraReading): Promise<AuraReading> {
    const id = this.currentAuraId++;
    const now = new Date();
    const auraReading: AuraReading = {
      ...reading,
      id,
      createdAt: now
    };
    this.auraReadings.set(id, auraReading);
    return auraReading;
  }

  async getAuraReadingsByUser(userId: number): Promise<AuraReading[]> {
    return Array.from(this.auraReadings.values())
      .filter(reading => reading.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAuraReading(id: number): Promise<AuraReading | undefined> {
    return this.auraReadings.get(id);
  }

  // Journal entry methods
  async createJournalEntry(entry: InsertJournal): Promise<Journal> {
    const id = this.currentJournalId++;
    const now = new Date();
    const journalEntry: Journal = {
      ...entry,
      id,
      createdAt: now
    };
    this.journals.set(id, journalEntry);
    return journalEntry;
  }

  async getJournalEntriesByUser(userId: number): Promise<Journal[]> {
    return Array.from(this.journals.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getJournalEntry(id: number): Promise<Journal | undefined> {
    return this.journals.get(id);
  }

  // Numerology reading methods
  async saveNumerologyReading(reading: InsertNumerologyReading): Promise<NumerologyReading> {
    const id = this.currentNumerologyId++;
    const now = new Date();
    const numerologyReading: NumerologyReading = {
      ...reading,
      id,
      createdAt: now
    };
    this.numerologyReadings.set(id, numerologyReading);
    return numerologyReading;
  }

  async getNumerologyReadingsByUser(userId: number): Promise<NumerologyReading[]> {
    return Array.from(this.numerologyReadings.values())
      .filter(reading => reading.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNumerologyReading(id: number): Promise<NumerologyReading | undefined> {
    return this.numerologyReadings.get(id);
  }
}

export const storage = new MemStorage();
