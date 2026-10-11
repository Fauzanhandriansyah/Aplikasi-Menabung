/**
 * Indonesian UMR (Upah Minimum Regional) data for major cities
 * Updated 2024 - values in IDR
 */
export const UMR_DATA: Record<string, number> = {
  "Jakarta": 4_300_000,
  "Surabaya": 3_900_000,
  "Bandung": 3_500_000,
  "Medan": 3_600_000,
  "Semarang": 3_200_000,
  "Makassar": 3_100_000,
  "Palembang": 3_000_000,
  "Yogyakarta": 2_800_000,
  "Malang": 3_000_000,
  "Batam": 3_800_000,
  "Bekasi": 4_200_000,
  "Tangerang": 4_100_000,
  "Depok": 4_100_000,
  "Bogor": 4_000_000,
};

export const DEFAULT_UMR = 3_500_000; // Default for unknown cities

/**
 * Get UMR for a city, fallback to default if not found
 */
export function getUMRForCity(city: string): number {
  return UMR_DATA[city] || DEFAULT_UMR;
}

/**
 * Calculate months to reach target savings
 */
export function calculateMonthsToTarget(
  currentSavings: number,
  monthlyIncome: number,
  savingsRate: number, // percentage (10-40)
  targetSavings: number = 100_000_000
): number {
  const monthlySavings = monthlyIncome * (savingsRate / 100);
  if (monthlySavings <= 0) return Infinity;
  
  const remainingTarget = Math.max(0, targetSavings - currentSavings);
  return Math.ceil(remainingTarget / monthlySavings);
}

/**
 * Calculate financial health score (0-100)
 */
export function calculateHealthScore(
  currentSavings: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  debt: number,
  targetSavings: number = 100_000_000
): number {
  let score = 0;

  // Savings ratio (0-30 points)
  const savingsRatio = monthlyIncome > 0 ? (currentSavings / targetSavings) * 100 : 0;
  score += Math.min(30, (savingsRatio / 100) * 30);

  // Expense ratio (0-30 points)
  const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 100;
  if (expenseRatio <= 50) score += 30;
  else if (expenseRatio <= 70) score += 20;
  else if (expenseRatio <= 90) score += 10;

  // Debt status (0-20 points)
  if (debt === 0) score += 20;
  else if (debt < monthlyIncome * 3) score += 10;
  else if (debt < monthlyIncome * 6) score += 5;

  // Savings rate (0-20 points)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  if (savingsRate >= 30) score += 20;
  else if (savingsRate >= 20) score += 15;
  else if (savingsRate >= 10) score += 10;
  else if (savingsRate >= 0) score += 5;

  return Math.min(100, Math.round(score));
}

/**
 * Generate savings milestones
 */
export function generateMilestones(): number[] {
  const milestones: number[] = [];
  for (let i = 1; i <= 100; i++) {
    milestones.push(i * 1_000_000);
  }
  return milestones;
}

/**
 * Calculate XP earned for actions
 */
export function calculateXP(action: string, amount?: number): number {
  const baseXP: Record<string, number> = {
    "daily_login": 10,
    "add_expense": 5,
    "reach_milestone": 100,
    "update_profile": 20,
    "streak_bonus": 50,
    "level_up": 200,
  };

  let xp = baseXP[action] || 0;
  if (action === "add_expense" && amount) {
    xp += Math.floor(amount / 100_000); // 1 XP per 100k IDR
  }
  return xp;
}

/**
 * Calculate level from XP
 */
export function calculateLevel(totalXP: number): number {
  // Level increases every 1000 XP
  return Math.floor(totalXP / 1000) + 1;
}

/**
 * Check if badge should be unlocked
 */
export function checkBadgeUnlock(
  currentSavings: number,
  level: number,
  streak: number,
  previousSavings: number
): string[] {
  const badges: string[] = [];

  // Milestone badges
  if (previousSavings < 1_000_000 && currentSavings >= 1_000_000) badges.push("first-million");
  if (previousSavings < 10_000_000 && currentSavings >= 10_000_000) badges.push("ten-million");
  if (previousSavings < 50_000_000 && currentSavings >= 50_000_000) badges.push("fifty-million");
  if (previousSavings < 100_000_000 && currentSavings >= 100_000_000) badges.push("hundred-million");

  // Level badges
  if (level >= 5) badges.push("level-5");
  if (level >= 10) badges.push("level-10");
  if (level >= 20) badges.push("level-20");

  // Streak badges
  if (streak >= 7) badges.push("streak-7");
  if (streak >= 30) badges.push("streak-30");
  if (streak >= 100) badges.push("streak-100");

  return badges;
}
