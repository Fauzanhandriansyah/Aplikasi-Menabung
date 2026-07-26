import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { TrendingUp, Zap, Target, Award } from "lucide-react";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [savingsRate, setSavingsRate] = useState(20);

  const profileQuery = trpc.profile.get.useQuery(undefined, { enabled: !!user });
  const targetQuery = trpc.financial.calculateTarget.useQuery(
    { savingsRate },
    { enabled: !!user }
  );
  const healthScoreQuery = trpc.financial.getHealthScore.useQuery(undefined, { enabled: !!user });
  const gamificationQuery = trpc.gamification.getStats.useQuery(undefined, { enabled: !!user });
  const leaderboardQuery = trpc.leaderboard.getTop.useQuery(undefined, { enabled: !!user });

  const profile = profileQuery.data;
  const target = targetQuery.data;
  const healthScore = healthScoreQuery.data || 0;
  const gamification = gamificationQuery.data;
  const leaderboard = leaderboardQuery.data || [];

  const progressPercent = profile ? (Number(profile.currentSavings) / 100_000_000) * 100 : 0;

  if (authLoading || profileQuery.isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-center text-white"><h1 className="text-4xl font-bold">100 Juta Pertama</h1></div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Halo, {user?.name}!</h1>
        <p className="text-slate-400 mb-8">Pantau progres menuju Rp100 juta</p>

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
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Kesehatan Finansial</p>
                <p className="text-2xl font-bold">{healthScore}/100</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Level</p>
                <p className="text-2xl font-bold">{gamification?.level || 1}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Streak</p>
                <p className="text-2xl font-bold">{gamification?.streak || 0} hari</p>
              </div>
              <Award className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Simulasi Tabungan</h3>
          <div className="flex gap-4 mb-6">
            {[10, 20, 30, 40].map((rate) => (
              <Button key={rate} onClick={() => setSavingsRate(rate)} variant={savingsRate === rate ? "default" : "outline"}>
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

        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Leaderboard Top 5</h3>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((entry, idx) => (
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
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg">Catat Pengeluaran</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 h-12 text-lg">Tanya AI Coach</Button>
          <Button className="bg-green-600 hover:bg-green-700 h-12 text-lg">Ubah Profil</Button>
        </div>
      </div>
    </div>
  );
}
