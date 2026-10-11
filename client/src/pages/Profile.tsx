import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";

const CITIES = ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Yogyakarta", "Malang", "Batam"];

export default function Profile() {
  const { user } = useAuth();
  const [city, setCity] = useState("");
  const [salary, setSalary] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [debt, setDebt] = useState("");
  const [usesUMRMode, setUsesUMRMode] = useState(false);

  const profileQuery = trpc.profile.get.useQuery(undefined, { enabled: !!user });
  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      profileQuery.refetch();
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      setCity(profileQuery.data.city || "");
      setSalary(profileQuery.data.salary ? String(profileQuery.data.salary) : "");
      setCurrentSavings(profileQuery.data.currentSavings ? String(profileQuery.data.currentSavings) : "");
      setMonthlyExpenses(profileQuery.data.monthlyExpenses ? String(profileQuery.data.monthlyExpenses) : "");
      setDebt(profileQuery.data.debt ? String(profileQuery.data.debt) : "");
      setUsesUMRMode(profileQuery.data.usesUMRMode || false);
    }
  }, [profileQuery.data]);

  const handleSave = () => {
    updateProfileMutation.mutate({
      city,
      salary: salary ? parseFloat(salary) : undefined,
      currentSavings: currentSavings ? parseFloat(currentSavings) : undefined,
      monthlyExpenses: monthlyExpenses ? parseFloat(monthlyExpenses) : undefined,
      debt: debt ? parseFloat(debt) : undefined,
      usesUMRMode,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Profil Saya</h1>

        <Card className="bg-slate-800 border-slate-700 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nama</label>
            <Input
              type="text"
              value={user?.name || ""}
              disabled
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kota</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Pilih Kota</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={usesUMRMode}
                onChange={(e) => setUsesUMRMode(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Gunakan Mode UMR</span>
            </label>
            <p className="text-xs text-slate-400">Jika diaktifkan, sistem akan menggunakan UMR kota Anda sebagai gaji</p>
          </div>

          {!usesUMRMode && (
            <div>
              <label className="block text-sm font-medium mb-2">Gaji Bulanan (Rp)</label>
              <Input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="0"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Tabungan Saat Ini (Rp)</label>
            <Input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              placeholder="0"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pengeluaran Bulanan (Rp)</label>
            <Input
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              placeholder="0"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Utang (Rp)</label>
            <Input
              type="number"
              value={debt}
              onChange={(e) => setDebt(e.target.value)}
              placeholder="0"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 w-full h-12"
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan Profil
          </Button>
        </Card>
      </div>
    </div>
  );
}
