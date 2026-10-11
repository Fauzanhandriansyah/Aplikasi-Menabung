import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getUserProfile, upsertUserProfile, getFinancialRecords, addFinancialRecord, getExpenses, addExpense, getGamification, createGamification, updateGamification, getBadges, getLeaderboard, updateLeaderboard, getCoachConversation, createCoachConversation, updateCoachConversation } from "./db";
import { calculateMonthsToTarget, calculateHealthScore, calculateXP, calculateLevel, getUMRForCity } from "./financial";
import { invokeLLM } from "./_core/llm";
import { getSessionCookieOptions } from "./_core/cookies";
import { protectedProcedure } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      return profile || null;
    }),
    update: protectedProcedure.input(z.object({
      city: z.string().optional(),
      salary: z.number().optional(),
      currentSavings: z.number().optional(),
      monthlyExpenses: z.number().optional(),
      debt: z.number().optional(),
      usesUMRMode: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {};
      if (input.city !== undefined) updateData.city = input.city;
      if (input.salary !== undefined) updateData.salary = input.salary.toString();
      if (input.currentSavings !== undefined) updateData.currentSavings = input.currentSavings.toString();
      if (input.monthlyExpenses !== undefined) updateData.monthlyExpenses = input.monthlyExpenses.toString();
      if (input.debt !== undefined) updateData.debt = input.debt.toString();
      if (input.usesUMRMode !== undefined) updateData.usesUMRMode = input.usesUMRMode;
      await upsertUserProfile(ctx.user.id, updateData as any);
      return { success: true };
    }),
  }),

  financial: router({
    getRecords: protectedProcedure.query(async ({ ctx }) => {
      return await getFinancialRecords(ctx.user.id);
    }),
    addRecord: protectedProcedure.input(z.object({
      month: z.string(),
      savings: z.number(),
      expenses: z.number(),
      savingsRate: z.number(),
    })).mutation(async ({ ctx, input }) => {
      await addFinancialRecord({
        userId: ctx.user.id,
        month: input.month,
        savings: input.savings.toString(),
        expenses: input.expenses.toString(),
        savingsRate: input.savingsRate.toString(),
      });
      return { success: true };
    }),
    calculateTarget: protectedProcedure.input(z.object({
      salary: z.number().optional(),
      city: z.string().optional(),
      currentSavings: z.number().optional(),
      savingsRate: z.number().optional(),
    })).query(async ({ ctx, input }) => {
      const profile = await getUserProfile(ctx.user.id);
      const salary = input.salary || profile?.salary || 0;
      const city = input.city || profile?.city || "Jakarta";
      const currentSavings = input.currentSavings ?? profile?.currentSavings ?? 0;
      const savingsRate = input.savingsRate || 20;

      const umr = getUMRForCity(city);
      const monthlyIncome = profile?.usesUMRMode ? umr : salary;
      const monthsToTarget = calculateMonthsToTarget(
        Number(currentSavings),
        Number(monthlyIncome),
        savingsRate
      );

      return {
        monthsToTarget,
        yearsToTarget: ((monthsToTarget || 0) / 12).toFixed(1),
        estimatedDate: new Date(Date.now() + (monthsToTarget || 0) * 30 * 24 * 60 * 60 * 1000),
        monthlyIncome: Number(monthlyIncome),
        monthlySavings: Number(monthlyIncome) * (savingsRate / 100),
      };
    }),
    getHealthScore: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      if (!profile) return 0;

      const score = calculateHealthScore(
        Number(profile.currentSavings) || 0,
        Number(profile.salary) || 0,
        Number(profile.monthlyExpenses) || 0,
        Number(profile.debt) || 0
      );
      return score;
    }),
  }),

  expenses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getExpenses(ctx.user.id);
    }),
    add: protectedProcedure.input(z.object({
      category: z.string(),
      amount: z.number(),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      await addExpense({
        userId: ctx.user.id,
        category: input.category,
        amount: input.amount.toString(),
        description: input.description,
        date: new Date(),
      });
      return { success: true };
    }),
  }),

  gamification: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      let gf = await getGamification(ctx.user.id);
      if (!gf) {
        await createGamification(ctx.user.id);
        gf = await getGamification(ctx.user.id);
      }
      return gf || { totalXP: 0, level: 1, streak: 0 };
    }),
    addXP: protectedProcedure.input(z.object({
      action: z.string(),
      amount: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const xp = calculateXP(input.action, input.amount);
      let gf = await getGamification(ctx.user.id);
      if (!gf) {
        await createGamification(ctx.user.id);
        gf = await getGamification(ctx.user.id);
      }

      const newTotalXP = (gf?.totalXP || 0) + xp;
      const newLevel = calculateLevel(newTotalXP);
      await updateGamification(ctx.user.id, {
        totalXP: newTotalXP,
        level: newLevel,
      });

      return { xp, totalXP: newTotalXP, level: newLevel };
    }),
    updateStreak: protectedProcedure.input(z.object({
      increment: z.boolean(),
    })).mutation(async ({ ctx, input }) => {
      const gf = await getGamification(ctx.user.id);
      if (!gf) return { streak: 0 };

      const today = new Date().toDateString();
      const lastDate = gf.lastStreakDate ? new Date(gf.lastStreakDate).toDateString() : null;
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      let newStreak = gf.streak || 0;
      if (input.increment) {
        if (lastDate === today) {
          // Already counted today
        } else if (lastDate === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      await updateGamification(ctx.user.id, {
        streak: newStreak,
        lastStreakDate: new Date(),
      });

      return { streak: newStreak };
    }),
    getBadges: protectedProcedure.query(async ({ ctx }) => {
      return await getBadges(ctx.user.id);
    }),
  }),

  leaderboard: router({
    getTop: protectedProcedure.query(async ({ ctx }) => {
      return await getLeaderboard(100);
    }),
    updateRank: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      const gf = await getGamification(ctx.user.id);
      if (!profile || !gf) return null;

      const anonymousName = `Saver${ctx.user.id}`;
      await updateLeaderboard(ctx.user.id, {
        anonymousName,
        totalSavings: profile.currentSavings?.toString() || "0",
        level: gf.level,
        totalXP: gf.totalXP,
      });

      return { success: true };
    }),
  }),

  coach: router({
    getConversation: protectedProcedure.query(async ({ ctx }) => {
      const conv = await getCoachConversation(ctx.user.id);
      if (!conv) return { messages: [] };
      return { messages: JSON.parse(conv.messages as unknown as string) };
    }),
    sendMessage: protectedProcedure.input(z.object({
      message: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const profile = await getUserProfile(ctx.user.id);
      const gf = await getGamification(ctx.user.id);

      // Get conversation history
      const conv = await getCoachConversation(ctx.user.id);
      let messages: unknown[] = conv ? JSON.parse(conv.messages as unknown as string) : [];

      // Add user message
      messages.push({ role: "user", content: input.message });

      // Generate AI response
      const systemPrompt = `Anda adalah AI Coach untuk aplikasi "100 Juta Pertama" yang membantu pengguna Indonesia mencapai target tabungan Rp100 juta.

Data pengguna:
- Gaji: Rp${Number(profile?.salary || 0).toLocaleString('id-ID')}
- Kota: ${profile?.city || 'Tidak diketahui'}
- Tabungan saat ini: Rp${Number(profile?.currentSavings || 0).toLocaleString('id-ID')}
- Pengeluaran bulanan: Rp${Number(profile?.monthlyExpenses || 0).toLocaleString('id-ID')}
- Utang: Rp${Number(profile?.debt || 0).toLocaleString('id-ID')}
- Level: ${gf?.level || 1}
- Total XP: ${gf?.totalXP || 0}

Berikan saran finansial yang personal, motivasi, dan actionable tips untuk mencapai Rp100 juta. Gunakan bahasa Indonesia yang ramah dan mudah dipahami.`;

      const response = await invokeLLM({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages as Array<{ role: "system" | "user" | "assistant" | "tool"; content: string }>),
        ],
      });

      const assistantMessage = (response.choices[0]?.message?.content as string) || "Maaf, terjadi kesalahan. Coba lagi nanti.";
      messages.push({ role: "assistant", content: assistantMessage });

      // Save conversation
      if (conv) {
        await updateCoachConversation(ctx.user.id, messages as unknown[]);
      } else {
        await createCoachConversation(ctx.user.id, messages as unknown[]);
      }

      return { message: assistantMessage };
    }),
  }),
});

export type AppRouter = typeof appRouter;
