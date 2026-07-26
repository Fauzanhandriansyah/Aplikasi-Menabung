import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Circle } from "lucide-react";

const MILESTONE_TARGETS = [1, 5, 10, 25, 50, 100];

export default function Milestones() {
  const { user } = useAuth();
  const profileQuery = trpc.profile.get.useQuery(undefined, { enabled: !!user });
  const profile = profileQuery.data;

  const currentSavings = Number(profile?.currentSavings || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Roadmap Tabungan</h1>
        <p className="text-slate-400 mb-8">Pantau pencapaian milestone Anda menuju Rp100 juta</p>

        <div className="space-y-4">
          {MILESTONE_TARGETS.map((target) => {
            const targetAmount = target * 1_000_000;
            const isAchieved = currentSavings >= targetAmount;
            const progressPercent = Math.min(100, (currentSavings / targetAmount) * 100);

            return (
              <Card key={target} className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-start gap-4">
                  {isAchieved ? (
                    <CheckCircle2 className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                  ) : (
                    <Circle className="w-8 h-8 text-slate-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold">Rp{target.toLocaleString("id-ID")} Juta</h3>
                      <span className={`text-sm font-medium ${isAchieved ? "text-green-400" : "text-slate-400"}`}>
                        {isAchieved ? "Tercapai" : "Dalam Proses"}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2 mb-2" />
                    <p className="text-sm text-slate-400">
                      Rp{currentSavings.toLocaleString("id-ID")} / Rp{targetAmount.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="bg-slate-800 border-slate-700 p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Statistik Progres</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Tabungan Saat Ini</p>
              <p className="text-2xl font-bold">Rp{currentSavings.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Target Akhir</p>
              <p className="text-2xl font-bold">Rp100.000.000</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Sisa Tabungan</p>
              <p className="text-2xl font-bold">Rp{Math.max(0, 100_000_000 - currentSavings).toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Persentase Selesai</p>
              <p className="text-2xl font-bold">{((currentSavings / 100_000_000) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
