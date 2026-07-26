import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { TrendingUp, Zap, Target, Award, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [savingsRate, setSavingsRate] = useState(20);

  const profileQuery = trpc.profile.get.useQuery(undefined, { enabled: !!user });
  const targetQuery = trpc.financial.calculateTarget.useQuery(
    { savingsRate },
    { enabled: !!user }
  );
  const healthScoreQuery = trpc.financial.getHealthScore.useQuery(undefined, { enabled: !!user });
  const recordsQuery = trpc.financial.getRecords.useQuery(undefined, { enabled: !!user });
  const expensesQuery = trpc.expenses.list.useQuery(undefined, { enabled: !!user });
  const gamificationQuery = trpc.gamification.getStats.useQuery(undefined, { enabled: !!user });
  const leaderboardQuery = trpc.leaderboard.getTop.useQuery(undefined, { enabled: !!user });

  const profile = profileQuery.data;
  const target = targetQuery.data;
  const healthScore = healthScoreQuery.data || 0;
  const records = recordsQuery.data || [];
  const expenses = expensesQuery.data || [];
  const gamification = gamificationQuery.data;
  const leaderboard = leaderboardQuery.data || [];

  const progressPercent = profile ? (Number(profile.currentSavings) / 100_000_000) * 100 : 0;

  // Prepare chart data
  const savingsChartData = records.map(r => ({
    month: r.month,
    savings: Number(r.savings),
  })).reverse();

  const expenseCategoryData = expenses.reduce((acc, e) => {
    const existing = acc.find(item => item.name === e.category);
    if (existing) {
      existing.value += Number(e.amount);
    } else {
      acc.push({ name: e.category, value: Number(e.amount) });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  if (authLoading || profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">100 Juta Pertama</h1>
          <p className="text-xl mb-8">Capai target tabungan Rp100 juta Anda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Halo, {user?.name || "Penabung"}!</h1>
          <p className="text-slate-400">Pantau progres menuju Rp100 juta Anda</p>
        </div>

        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 mb-8 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-100 mb-2">Tabungan Saat Ini</p>
              <h2 className="text-4xl font-bold">Rp{Number(profile?.currentSavings || 0).toLocaleString("id-ID")}</h2>
            </div>
            <div className="text-right">
              <p className="text-blue-100 mb-2">Target</p>
              <p className="text-2xl font-bold">Rp100.000.000</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3 mb-4" />
          <p className="text-blue-100">{progressPercent.toFixed(1)}% Selesai</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Berapa Lama?</p>
                <p className="text-2xl font-bold">{target?.monthsToTarget || 0} bulan</p>
                <p className="text-slate-400 text-xs mt-1">{target?.yearsToTarget || 0} tahun</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Kesehatan Finansial</p>
                <p className="text-2xl font-bold">{healthScore}/100</p>
                <p className="text-slate-400 text-xs mt-1">Skor</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Level</p>
                <p className="text-2xl font-bold">{gamification?.level || 1}</p>
                <p className="text-slate-400 text-xs mt-1">{gamification?.totalXP || 0} XP</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Streak</p>
                <p className="text-2xl font-bold">{gamification?.streak || 0} hari</p>
                <p className="text-slate-400 text-xs mt-1">Konsisten</p>
              </div>
              <Award className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Simulasi Tabungan</h3>
          <div className="flex gap-4 mb-6">
            {[10, 20, 30, 40].map((rate) => (
              <Button
                key={rate}
                onClick={() => setSavingsRate(rate)}
                variant={savingsRate === rate ? "default" : "outline"}
              >
                {rate}%
              </Button>
            ))}
          </div>
          {target && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Tabungan Bulanan</p>
                <p className="text-2xl font-bold">Rp{Math.round(target.monthlySavings).toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Estimasi Tercapai</p>
                <p className="text-2xl font-bold">{new Date(target.estimatedDate).toLocaleDateString("id-ID")}</p>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tren Tabungan
            </h3>
            {savingsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={savingsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-400">
                Belum ada data
              </div>
            )}
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Breakdown Pengeluaran
            </h3>
            {expenseCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: Rp${value.toLocaleString("id-ID")}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rp${value.toLocaleString("id-ID")}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-400">
                Belum ada pengeluaran
              </div>
            )}
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Leaderboard Top 5</h3>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).length === 0 ? (
              <p className="text-slate-400">Belum ada data leaderboard</p>
            ) : (
              leaderboard.slice(0, 5).map((entry, idx) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-yellow-400">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{entry.anonymousName}</p>
                      <p className="text-sm text-slate-400">Level {entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Rp{Number(entry.totalSavings).toLocaleString("id-ID")}</p>
                    <p className="text-sm text-slate-400">{entry.totalXP} XP</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg">Catat Pengeluaran</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 h-12 text-lg">Tanya AI Coach</Button>
          <Button className="bg-green-600 hover:bg-green-700 h-12 text-lg">Roadmap Milestone</Button>
          <Button className="bg-orange-600 hover:bg-orange-700 h-12 text-lg">Ubah Profil</Button>
        </div>
      </div>
    </div>
  );
}
