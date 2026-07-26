import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userProfiles, InsertUserProfile, financialRecords, InsertFinancialRecord, expenses, InsertExpense, gamification, InsertGamification, badges, leaderboard, InsertLeaderboard, milestones, InsertMilestone, coachConversations } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * User Profile Queries
 */
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserProfile(userId: number, data: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userProfiles).values({ userId, ...data }).onDuplicateKeyUpdate({
    set: data,
  });
}

/**
 * Financial Records Queries
 */
export async function getFinancialRecords(userId: number, limit = 12) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(financialRecords)
    .where(eq(financialRecords.userId, userId))
    .orderBy(desc(financialRecords.month))
    .limit(limit);
}

export async function addFinancialRecord(data: InsertFinancialRecord) {
  const db = await getDb();
  if (!db) return;
  await db.insert(financialRecords).values(data);
}

/**
 * Expense Queries
 */
export async function getExpenses(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.date))
    .limit(limit);
}

export async function addExpense(data: InsertExpense) {
  const db = await getDb();
  if (!db) return;
  await db.insert(expenses).values(data);
}

/**
 * Gamification Queries
 */
export async function getGamification(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(gamification).where(eq(gamification.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGamification(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(gamification).values({ userId });
}

export async function updateGamification(userId: number, data: Partial<InsertGamification>) {
  const db = await getDb();
  if (!db) return;
  await db.update(gamification).set(data).where(eq(gamification.userId, userId));
}

/**
 * Badge Queries
 */
export async function getBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(badges).where(eq(badges.userId, userId));
}

export async function addBadge(userId: number, badgeType: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(badges).values({ userId, badgeType });
}

/**
 * Leaderboard Queries
 */
export async function getLeaderboard(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leaderboard)
    .orderBy(desc(leaderboard.totalXP))
    .limit(limit);
}

export async function updateLeaderboard(userId: number, data: Partial<InsertLeaderboard>) {
  const db = await getDb();
  if (!db) return;
  const fullData = {
    userId,
    anonymousName: data.anonymousName || `User${userId}`,
    totalSavings: data.totalSavings || "0",
    level: data.level || 1,
    totalXP: data.totalXP || 0,
  };
  await db.insert(leaderboard).values(fullData).onDuplicateKeyUpdate({
    set: data,
  });
}

/**
 * Milestone Queries
 */
export async function getMilestones(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(milestones).where(eq(milestones.userId, userId));
}

export async function addMilestone(data: InsertMilestone) {
  const db = await getDb();
  if (!db) return;
  await db.insert(milestones).values(data);
}

/**
 * Coach Conversation Queries
 */
export async function getCoachConversation(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coachConversations).where(eq(coachConversations.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCoachConversation(userId: number, messages: unknown[]) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coachConversations).values({ userId, messages: JSON.stringify(messages) });
}

export async function updateCoachConversation(userId: number, messages: unknown[]) {
  const db = await getDb();
  if (!db) return;
  await db.update(coachConversations).set({ messages: JSON.stringify(messages) }).where(eq(coachConversations.userId, userId));
}
