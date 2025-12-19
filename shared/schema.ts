import { pgTable, text, serial, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull().default("client"), // "client", "healer", or "semi-healer"
  birthDate: text("birth_date"),
  email: text("email"),
  mobileNumber: text("mobile_number"),
  profilePictureUrl: text("profile_picture_url"), // Base64 encoded or URL to profile picture
  credits: integer("credits").default(0), // Will be set programmatically based on user type
  soulEnergy: integer("soul_energy").default(0), // Spiritual energy gained from scans and activities
  manifestIntention: text("manifest_intention"), // Health / Relationships / Abundance / Clarity
  energyLevel: text("energy_level"), // Low / Balanced / High
  biggestBlock: text("biggest_block"), // Health / Money / Relationships / Career / etc
  smsNotificationsEnabled: boolean("sms_notifications_enabled").default(false),
  browserNotificationsEnabled: boolean("browser_notifications_enabled").default(false),
  emailNotificationsEnabled: boolean("email_notifications_enabled").default(true),
  healerSessionCount: integer("healer_session_count").default(0), // Total sessions healed (for healers)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Allow null for anonymous subscriptions
  endpoint: text("endpoint").notNull().unique(),
  keys: text("keys").notNull(), // JSON string containing p256dh and auth keys
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("push_subscriptions_user_id_idx").on(table.userId),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  userType: true,
  birthDate: true,
  email: true,
  mobileNumber: true,
  credits: true,
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
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
}, (table) => ({
  // Performance indexes for faster healer dashboard queries
  performedByCreatedAtIdx: index("aura_readings_performed_by_created_at_idx").on(table.performedBy, table.createdAt),
  userIdCreatedAtIdx: index("aura_readings_user_id_created_at_idx").on(table.userId, table.createdAt),
  createdAtIdx: index("aura_readings_created_at_idx").on(table.createdAt),
}));

export const insertAuraReadingSchema = createInsertSchema(auraReadings).omit({
  id: true,
  createdAt: true,
});

export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  mood: text("mood"), // joyful, calm, energized, peaceful, stressed, neutral, grateful, inspired, anxious, content
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
  pdfData: text("pdf_data"), // Base64-encoded PDF data for download from history
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNumerologyReadingSchema = createInsertSchema(numerologyReadings).omit({
  id: true,
  createdAt: true,
});

export const objectAnalyses = pgTable("object_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  performedBy: integer("performed_by").references(() => users.id), // Which healer account performed this analysis
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

export const healerRatings = pgTable("healer_ratings", {
  id: serial("id").primaryKey(),
  healerId: integer("healer_id").notNull().references(() => healers.id),
  raterId: integer("rater_id").notNull().references(() => users.id),
  raterUsername: text("rater_username").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  healerIdIdx: index("healer_ratings_healer_id_idx").on(table.healerId),
  raterIdIdx: index("healer_ratings_rater_id_idx").on(table.raterId),
}));

export const insertHealerSchema = createInsertSchema(healers).omit({
  id: true,
  createdAt: true,
});

export const insertHealerBookingSchema = createInsertSchema(healerBookings).omit({
  id: true,
  createdAt: true,
});

export const insertHealerRatingSchema = createInsertSchema(healerRatings).omit({
  id: true,
  createdAt: true,
});

export const healerBadges = pgTable("healer_badges", {
  id: serial("id").primaryKey(),
  healerId: integer("healer_id").notNull().references(() => healers.id),
  badgeType: text("badge_type").notNull(), // "most_rated", "most_5_star", "best_healer"
  badgeTitle: text("badge_title").notNull(),
  badgeIcon: text("badge_icon").notNull(), // emoji or icon code
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // Expires after 30 days
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  healerIdIdx: index("healer_badges_healer_id_idx").on(table.healerId),
  badgeTypeIdx: index("healer_badges_badge_type_idx").on(table.badgeType),
}));

export const insertHealerBadgeSchema = createInsertSchema(healerBadges).omit({
  id: true,
  createdAt: true,
  awardedAt: true,
});

// User achievements/badges (permanent badges earned by healers)
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementType: text("achievement_type").notNull(), // "week_warrior", "spiritual_guardian", etc.
  achievementTitle: text("achievement_title").notNull(),
  achievementIcon: text("achievement_icon").notNull(),
  achievementDescription: text("achievement_description").notNull(),
  tier: text("tier").notNull(), // BRONZE, SILVER, GOLD, PLATINUM
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_achievements_user_id_idx").on(table.userId),
  achievementTypeIdx: index("user_achievements_achievement_type_idx").on(table.achievementType),
}));

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
  awardedAt: true,
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

// Vibe readings performed by healers (for healer dashboard tracking)
export const vibeReadings = pgTable("vibe_readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id), // The healer who performed the reading
  personalityColor: text("personality_color").notNull(),
  colorMeaning: text("color_meaning").notNull(),
  uploadedImage: text("uploaded_image"), // Base64 image data of uploaded image
  visualizedImage: text("visualized_image"), // Base64 image data of color visualization
  sessionId: text("session_id"), // To track unique vibe analysis sessions
  clientName: text("client_name"), // Optional client name if provided
  fullAnalysis: text("full_analysis"), // Complete analysis result as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVibeReadingSchema = createInsertSchema(vibeReadings).omit({
  id: true,
  createdAt: true,
});

export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  username: text("username").notNull(),
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

// PDF storage table for exact PDF retrieval
export const pdfStorage = pgTable("pdf_storage", {
  id: serial("id").primaryKey(),
  auraReadingId: integer("aura_reading_id").notNull().references(() => auraReadings.id),
  healerId: integer("healer_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  pdfData: text("pdf_data").notNull(), // Base64 encoded PDF data
  clientName: text("client_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPdfStorageSchema = createInsertSchema(pdfStorage).omit({
  id: true,
  createdAt: true,
});

// Psychological Profile - tracks user emotional patterns and preferences
export const psychologicalProfiles = pgTable("psychological_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  // Dominant emotional states (tracked from journal entries and interactions)
  dominantMood: text("dominant_mood"), // "calm", "energized", "balanced", "seeking_growth"
  moodHistory: text("mood_history"), // JSON array of recent moods
  // Energy patterns
  averageEnergyLevel: integer("average_energy_level").default(5), // 1-10 scale
  energyTrend: text("energy_trend"), // "increasing", "decreasing", "stable"
  // Color preferences and associations
  preferredColors: text("preferred_colors"), // JSON array of colors user responds to
  // Behavioral patterns
  activeTimeOfDay: text("active_time_of_day"), // "morning", "afternoon", "evening", "night"
  journalFrequency: integer("journal_frequency").default(0), // Entries per week
  meditationMinutes: integer("meditation_minutes").default(0), // Total minutes
  // Psychological insights
  stressIndicators: text("stress_indicators"), // JSON array of stress patterns
  growthAreas: text("growth_areas"), // JSON array of identified development areas
  supportivePrompts: text("supportive_prompts"), // JSON array of personalized prompts
  // Recommendations
  recommendedActivities: text("recommended_activities"), // JSON array
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPsychologicalProfileSchema = createInsertSchema(psychologicalProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Login sessions for tracking user activity and streaks
export const loginSessions = pgTable("login_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  loginDate: timestamp("login_date").notNull(), // Date of login (stored as UTC date)
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdLoginDateIdx: index("login_sessions_user_id_login_date_idx").on(table.userId, table.loginDate),
}));

export const insertLoginSessionSchema = createInsertSchema(loginSessions).omit({
  id: true,
  createdAt: true,
});

// Mood tracking - detailed emotional state snapshots
export const moodSnapshots = pgTable("mood_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  mood: text("mood").notNull(), // "joyful", "calm", "energized", "neutral", "stressed", "tired"
  intensity: integer("intensity").notNull(), // 1-10 scale (energy level)
  energyLevel: integer("energy_level").notNull(), // 1-10 scale
  stressLevel: integer("stress_level").notNull(), // 1-10 scale
  sleepQuality: integer("sleep_quality").notNull(), // 1-10 scale
  socialConnection: integer("social_connection").notNull(), // 1-10 scale
  physicalActivity: integer("physical_activity").notNull(), // 1-10 scale
  insights: text("insights"), // JSON array of generated insights
  triggers: text("triggers"), // What prompted this mood
  context: text("context"), // Where/what they were doing
  colorPreference: text("color_preference"), // Color that resonates with their current state
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMoodSnapshotSchema = createInsertSchema(moodSnapshots).omit({
  id: true,
  timestamp: true,
});

// Meditation Sessions - track completed meditation sessions
export const meditationSessions = pgTable("meditation_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  meditationId: integer("meditation_id").notNull(), // ID of the meditation from the preset list
  meditationTitle: text("meditation_title").notNull(),
  durationMinutes: integer("duration_minutes").notNull(), // Actual duration of the meditation
  category: text("category").notNull(), // breathe, focus, calm, etc.
  completed: boolean("completed").default(true), // Only insert completed sessions
  energyGained: integer("energy_gained").default(25), // Soul energy gained (can be overridden)
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Composite index for efficient per-user ordered lookups
  userIdCreatedAtIdx: index("meditation_sessions_user_id_created_at_idx").on(table.userId, table.createdAt),
}));

export const insertMeditationSessionSchema = createInsertSchema(meditationSessions).omit({
  id: true,
  createdAt: true,
});

// Favorite Meditations - bookmarks for users
export const favoriteMeditations = pgTable("favorite_meditations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  meditationId: integer("meditation_id").notNull(), // ID of the meditation from the preset list
  meditationTitle: text("meditation_title").notNull(),
  category: text("category").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  author: text("author"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdMeditationIdIdx: index("favorite_meditations_user_id_meditation_id_idx").on(table.userId, table.meditationId),
}));

export const insertFavoriteMeditationSchema = createInsertSchema(favoriteMeditations).omit({
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
export type HealerRating = typeof healerRatings.$inferSelect;
export type InsertHealerRating = z.infer<typeof insertHealerRatingSchema>;
export type HealerBadge = typeof healerBadges.$inferSelect;
export type InsertHealerBadge = z.infer<typeof insertHealerBadgeSchema>;
export type VibeFeedback = typeof vibeFeedback.$inferSelect;
export type InsertVibeFeedback = z.infer<typeof insertVibeFeedbackSchema>;
export type VibeReading = typeof vibeReadings.$inferSelect;
export type InsertVibeReading = z.infer<typeof insertVibeReadingSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PdfStorage = typeof pdfStorage.$inferSelect;
export type InsertPdfStorage = z.infer<typeof insertPdfStorageSchema>;
export type PsychologicalProfile = typeof psychologicalProfiles.$inferSelect;
export type InsertPsychologicalProfile = z.infer<typeof insertPsychologicalProfileSchema>;
export type MoodSnapshot = typeof moodSnapshots.$inferSelect;
export type InsertMoodSnapshot = z.infer<typeof insertMoodSnapshotSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type MeditationSession = typeof meditationSessions.$inferSelect;
export type InsertMeditationSession = z.infer<typeof insertMeditationSessionSchema>;
export type FavoriteMeditation = typeof favoriteMeditations.$inferSelect;
export type InsertFavoriteMeditation = z.infer<typeof insertFavoriteMeditationSchema>;

// User Statistics Schema
export const userStatsSchema = z.object({
  meditationHours: z.number().default(0),
  healersConsulted: z.number().default(0),
  auraScans: z.number().default(0),
  vibeScans: z.number().default(0),
  numerologyReadings: z.number().default(0),
  objectScans: z.number().default(0),
  totalSessions: z.number().default(0),
  journalEntries: z.number().default(0),
  // Healer-specific stats
  clientsServed: z.number().optional(),
  sessionsPerformed: z.number().optional(),
});

export type UserStats = z.infer<typeof userStatsSchema>;

// Achievements and Gamification Tables
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementType: text("achievement_type").notNull(), // "first_aura", "first_journal", "7_day_streak", "50_soul_energy", "level_up", etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"), // Emoji or icon identifier
  badgeType: text("badge_type").notNull().default("bronze"), // "bronze" | "silver" | "gold" | "platinum"
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("achievements_user_id_idx").on(table.userId),
  userIdAchievementIdx: index("achievements_user_id_type_idx").on(table.userId, table.achievementType),
}));

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
  unlockedAt: true,
}).extend({
  badgeType: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
});

// Color Collector - tracks which aura colors user has collected
export const colorCollectors = pgTable("color_collectors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  collectedColors: text("collected_colors").notNull(), // JSON array of color strings
  totalCollected: integer("total_collected").default(0),
  completionPercentage: integer("completion_percentage").default(0),
  badgeUnlocked: boolean("badge_unlocked").default(false),
  bonusCreditsAwarded: boolean("bonus_credits_awarded").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertColorCollectorSchema = createInsertSchema(colorCollectors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Chakra Unlocks - tracks which chakras user has unlocked
export const chakraUnlocks = pgTable("chakra_unlocks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  unlockedChakras: text("unlocked_chakras").notNull(), // JSON array of chakra numbers (1-9)
  totalUnlocked: integer("total_unlocked").default(0),
  currentFocusChakra: integer("current_focus_chakra"), // Which chakra they're working on
  masteryProgress: text("mastery_progress").notNull(), // JSON object {1: 0.5, 2: 0.8, ...} for each chakra
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChakraUnlockSchema = createInsertSchema(chakraUnlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Payment Plans - subscription tiers available
export const paymentPlans = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Free Trial", "Starter", "Professional", etc.
  stripePriceId: text("stripe_price_id"), // Stripe price ID for this plan
  price: integer("price"), // Price in cents
  billingCycle: text("billing_cycle"), // "monthly", "quarterly", "annually", "one-time"
  credits: integer("credits"), // Credits included in this plan
  features: text("features").notNull(), // JSON array of features
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({
  id: true,
  createdAt: true,
});

// Payment Transactions - track user purchases
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  planId: integer("plan_id").notNull().references(() => paymentPlans.id),
  amount: integer("amount").notNull(), // Amount in cents
  status: text("status").notNull(), // "pending", "completed", "failed", "refunded"
  billingEmail: text("billing_email"),
  creditsBefore: integer("credits_before"),
  creditsAfter: integer("credits_after"),
  receiptUrl: text("receipt_url"), // Stripe receipt URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("payment_transactions_user_id_idx").on(table.userId),
  userIdCreatedAtIdx: index("payment_transactions_user_id_created_at_idx").on(table.userId, table.createdAt),
}));

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// User Subscriptions - track active subscriptions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  planId: integer("plan_id").references(() => paymentPlans.id),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull().default("active"), // "active", "cancelled", "paused", "expired"
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  renewalDate: timestamp("renewal_date"),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_subscriptions_user_id_idx").on(table.userId),
}));

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type ColorCollector = typeof colorCollectors.$inferSelect;
export type InsertColorCollector = z.infer<typeof insertColorCollectorSchema>;
export type ChakraUnlock = typeof chakraUnlocks.$inferSelect;
export type InsertChakraUnlock = z.infer<typeof insertChakraUnlockSchema>;
export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
