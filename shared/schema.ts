import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull().default("client"), // "client" or "healer"
  birthDate: text("birth_date"),
  email: text("email"),
  mobileNumber: text("mobile_number"),
  credits: integer("credits").default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  userType: true,
  birthDate: true,
  email: true,
  mobileNumber: true,
  credits: true,
});

export const auraReadings = pgTable("aura_readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  performedBy: integer("performed_by").references(() => users.id), // Which healer account performed this reading
  name: text("name").notNull(), // Name entered for this aura reading
  imageUrl: text("image_url").notNull(),
  dominantColor: text("dominant_color").notNull(),
  secondaryColor: text("secondary_color"),
  energyLevel: integer("energy_level").notNull(),
  analysis: text("analysis").notNull(), // Full JSON analysis data
  // Individual color zones for quick access
  personalityColor: text("personality_color"),
  givingColor: text("giving_color"),
  receivingColor: text("receiving_color"),
  thinkingColor: text("thinking_color"),
  // Spiritual guidance and traits
  spiritualGuidance: text("spiritual_guidance"),
  personalityTraits: text("personality_traits"), // JSON array as string
  // Chakra activity scores
  chakraActivity: text("chakra_activity"), // JSON object as string
  // Zones data for detailed analysis
  zones: text("zones"), // JSON object as string
  // Color meanings for each position
  colorMeanings: text("color_meanings"), // JSON object as string
  // Detailed analysis text
  detailedAnalysis: text("detailed_analysis"),
  // Aura color spectrum for extended analysis
  auraColorSpectrum: text("aura_color_spectrum"), // JSON array as string
  // Processed aura image with visualization
  processedAuraImage: text("processed_aura_image"), // Base64 image data
  rating: integer("rating"), // 1-5 star rating
  reviewText: text("review_text"), // Optional review text
  healerNotes: text("healer_notes"), // Professional healer notes
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
  performedBy: integer("performed_by").references(() => users.id), // Which healer account performed this reading
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  lifePathNumber: integer("life_path_number").notNull(),
  destinyNumber: integer("destiny_number").notNull(),
  soulUrgeNumber: integer("soul_urge_number").notNull(),
  personalityNumber: integer("personality_number").notNull(),
  personalYearNumber: integer("personal_year_number").notNull(),
  interpretation: text("interpretation").notNull(),
  healerNotes: text("healer_notes"), // Professional healer notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNumerologyReadingSchema = createInsertSchema(numerologyReadings).omit({
  id: true,
  createdAt: true,
});

export const objectAnalyses = pgTable("object_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(), // Name entered for this object analysis
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
  username: text("username").notNull().unique(), // Login username
  password: text("password").notNull(), // Hashed password
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
  status: text("status").default("pending"), // "pending", "accepted", "rejected", "cancelled"
  healerResponse: text("healer_response"), // Healer's response message
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"), // When healer responded
});

export const insertHealerSchema = createInsertSchema(healers).omit({
  id: true,
  createdAt: true,
});

export const insertHealerBookingSchema = createInsertSchema(healerBookings).omit({
  id: true,
  createdAt: true,
});

export const vibeFeedback = pgTable("vibe_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  personalityColor: text("personality_color").notNull(),
  colorMeaning: text("color_meaning").notNull(),
  feedback: text("feedback").notNull(), // "yes" or "no"
  sessionId: text("session_id"), // To track unique vibe analysis sessions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVibeFeedbackSchema = createInsertSchema(vibeFeedback).omit({
  id: true,
  createdAt: true,
});

export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // Positive for additions, negative for usage
  transactionType: text("transaction_type").notNull(), // "purchase", "aura_analysis", "object_analysis", "vibe_analysis", "bonus"
  description: text("description").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

// OTP verification table for mobile numbers during registration
export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  mobileNumber: text("mobile_number").notNull(),
  otp: text("otp").notNull(),
  verified: boolean("verified").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
});

// Password reset tokens table for forgot password functionality
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  mobileNumber: text("mobile_number"), // Add mobile number field
  token: text("token").notNull(),
  used: boolean("used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
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
export type VibeFeedback = typeof vibeFeedback.$inferSelect;
export type InsertVibeFeedback = z.infer<typeof insertVibeFeedbackSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
