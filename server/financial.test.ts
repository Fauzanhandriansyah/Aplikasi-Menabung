import { describe, it, expect } from "vitest";
import { calculateMonthsToTarget, calculateHealthScore, generateMilestones, calculateXP, calculateLevel } from "./financial";

describe("Financial Calculations", () => {
  describe("calculateMonthsToTarget", () => {
    it("should calculate months to reach 100 million with 20% savings rate", () => {
      const months = calculateMonthsToTarget(5_000_000, 5_000_000, 20);
      expect(months).toBeGreaterThan(0);
      expect(months).toBeLessThan(500);
    });

    it("should return 0 months if already at target", () => { 
      const months = calculateMonthsToTarget(100_000_000, 5_000_000, 20);
      expect(months).toBeLessThanOrEqual(0);
    });

    it("should calculate fewer months with higher savings rate", () => {
      const months20 = calculateMonthsToTarget(5_000_000, 5_000_000, 20);
      const months40 = calculateMonthsToTarget(5_000_000, 5_000_000, 40);
      expect(months40).toBeLessThan(months20);
    });
  });

  describe("calculateHealthScore", () => {
    it("should return a score between 0 and 100", () => {
      const score = calculateHealthScore(10_000_000, 5_000_000, 2_000_000, 0);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should give higher score with more savings", () => {
      const lowSavings = calculateHealthScore(1_000_000, 5_000_000, 2_000_000, 0);
      const highSavings = calculateHealthScore(50_000_000, 5_000_000, 2_000_000, 0);
      expect(highSavings).toBeGreaterThan(lowSavings);
    });

    it("should penalize high debt", () => {
      const noDebt = calculateHealthScore(10_000_000, 5_000_000, 2_000_000, 0);
      const withDebt = calculateHealthScore(10_000_000, 5_000_000, 2_000_000, 20_000_000);
      expect(withDebt).toBeLessThan(noDebt);
    });
  });

  describe("generateMilestones", () => {
    it("should generate milestones from 1M to 100M", () => {
      const milestones = generateMilestones();
      expect(milestones.length).toBe(100);
      expect(milestones[0]).toBe(1_000_000);
      expect(milestones[milestones.length - 1]).toBe(100_000_000);
    });
  });

  describe("calculateXP and calculateLevel", () => {
    it("should calculate positive XP for actions", () => {
      const xp = calculateXP("add_expense");
      expect(xp).toBeGreaterThan(0);
    });

    it("should calculate level from total XP", () => {
      const level1 = calculateLevel(0);
      const level5 = calculateLevel(1000);
      const level10 = calculateLevel(5000);
      expect(level5).toBeGreaterThanOrEqual(level1);
      expect(level10).toBeGreaterThanOrEqual(level5);
    });

    it("should require more XP for higher levels", () => {
      const level1XP = calculateLevel(100);
      const level5XP = calculateLevel(1000);
      expect(level5XP).toBeGreaterThanOrEqual(level1XP);
    });
  });
});
