import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull().default("client"), // "client" or "healer"
  birthDate: text("birth_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  userType: true,
  birthDate: true,
});

export const auraReadings = pgTable("aura_readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  imageUrl: text("image_url").notNull(),
  dominantColor: text("dominant_color").notNull(),
  secondaryColor: text("secondary_color"),
  energyLevel: integer("energy_level").notNull(),
  analysis: text("analysis").notNull(),
  rating: integer("rating"), // 1-5 star rating
  reviewText: text("review_text"), // Optional review text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuraReadingSchema = createInsertSchema(auraReadings).omit({
  id: true,
  createdAt: true,
});

export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  energyLevel: integer("energy_level").notNull(),
  reflections: text("reflections").notNull(),
  gratitude: text("gratitude").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJournalSchema = createInsertSchema(journals).omit({
  id: true,
  createdAt: true,
});

export const numerologyReadings = pgTable("numerology_readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  lifePathNumber: integer("life_path_number").notNull(),
  destinyNumber: integer("destiny_number").notNull(),
  soulUrgeNumber: integer("soul_urge_number").notNull(),
  personalityNumber: integer("personality_number").notNull(),
  interpretation: text("interpretation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNumerologyReadingSchema = createInsertSchema(numerologyReadings).omit({
  id: true,
  createdAt: true,
});

export const objectAnalyses = pgTable("object_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  imageUrl: text("image_url").notNull(),
  objectName: text("object_name").notNull(),
  objectDescription: text("object_description").notNull(),
  objectPurpose: text("object_purpose").notNull(),
  auraColor: text("aura_color").notNull(),
  auraDescription: text("aura_description").notNull(),
  energyLevel: integer("energy_level").notNull(),
  energyQualities: text("energy_qualities").notNull(), // JSON string array
  historicalSignificance: text("historical_significance"),
  spiritualSignificance: text("spiritual_significance"),
  detailedAnalysis: text("detailed_analysis").notNull(),
  rating: integer("rating"), // 1-5 star rating
  reviewText: text("review_text"), // Optional review text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertObjectAnalysisSchema = createInsertSchema(objectAnalyses).omit({
  id: true,
  createdAt: true,
});

export const healers = pgTable("healers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  description: text("description").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  imageUrl: text("image_url"),
  rating: integer("rating").default(5),
  experience: text("experience"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const healerBookings = pgTable("healer_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  healerId: integer("healer_id").notNull().references(() => healers.id),
  message: text("message"),
  status: text("status").default("pending"), // "pending", "confirmed", "cancelled"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHealerSchema = createInsertSchema(healers).omit({
  id: true,
  createdAt: true,
});

export const insertHealerBookingSchema = createInsertSchema(healerBookings).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AuraReading = typeof auraReadings.$inferSelect;
export type InsertAuraReading = z.infer<typeof insertAuraReadingSchema>;
export type Journal = typeof journals.$inferSelect;
export type InsertJournal = z.infer<typeof insertJournalSchema>;
export type NumerologyReading = typeof numerologyReadings.$inferSelect;
export type InsertNumerologyReading = z.infer<typeof insertNumerologyReadingSchema>;
export type ObjectAnalysis = typeof objectAnalyses.$inferSelect;
export type InsertObjectAnalysis = z.infer<typeof insertObjectAnalysisSchema>;
export type Healer = typeof healers.$inferSelect;
export type InsertHealer = z.infer<typeof insertHealerSchema>;
export type HealerBooking = typeof healerBookings.$inferSelect;
export type InsertHealerBooking = z.infer<typeof insertHealerBookingSchema>;
