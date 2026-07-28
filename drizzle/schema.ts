import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {

  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User financial profile
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  city: varchar("city", { length: 100 }),
  salary: decimal("salary", { precision: 15, scale: 2 }),
  savingsTarget: decimal("savingsTarget", { precision: 15, scale: 2 }).default("100000000"),
  currentSavings: decimal("currentSavings", { precision: 15, scale: 2 }).default("0"),
  monthlyExpenses: decimal("monthlyExpenses", { precision: 15, scale: 2 }).default("0"),
  debt: decimal("debt", { precision: 15, scale: 2 }).default("0"),
  usesUMRMode: boolean("usesUMRMode").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Financial records (monthly snapshots)
 */
export const financialRecords = mysqlTable("financial_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  savings: decimal("savings", { precision: 15, scale: 2 }).notNull(),
  expenses: decimal("expenses", { precision: 15, scale: 2 }).notNull(),
  savingsRate: decimal("savingsRate", { precision: 5, scale: 2 }).notNull(), // percentage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = typeof financialRecords.$inferInsert;

/**
 * Expense tracking
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // food, transport, entertainment, etc
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * Gamification: XP and levels
 */
export const gamification = mysqlTable("gamification", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalXP: int("totalXP").default(0).notNull(),
  level: int("level").default(1).notNull(),
  streak: int("streak").default(0).notNull(), // consecutive days of savings
  lastStreakDate: timestamp("lastStreakDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Gamification = typeof gamification.$inferSelect;
export type InsertGamification = typeof gamification.$inferInsert;

/**
 * Badges/Achievements
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeType: varchar("badgeType", { length: 50 }).notNull(), // first-million, streak-7, level-10, etc
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * Leaderboard (anonymous)
 */
export const leaderboard = mysqlTable("leaderboard", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  anonymousName: varchar("anonymousName", { length: 50 }).notNull(),
  totalSavings: decimal("totalSavings", { precision: 15, scale: 2 }).notNull(),
  level: int("level").notNull(),
  totalXP: int("totalXP").notNull(),
  rank: int("rank"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Leaderboard = typeof leaderboard.$inferSelect;
export type InsertLeaderboard = typeof leaderboard.$inferInsert;

/**
 * Savings milestones tracking
 */
export const milestones = mysqlTable("milestones", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  targetAmount: decimal("targetAmount", { precision: 15, scale: 2 }).notNull(),
  achievedAt: timestamp("achievedAt"),
  estimatedDate: timestamp("estimatedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;

/**
 * AI Coach conversation history
 */
export const coachConversations = mysqlTable("coach_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  messages: json("messages").notNull(), // Array of { role, content }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachConversation = typeof coachConversations.$inferSelect;
export type InsertCoachConversation = typeof coachConversations.$inferInsert;
