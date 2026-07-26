import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

const CATEGORIES = ["Makanan", "Transport", "Hiburan", "Kesehatan", "Belanja", "Lainnya"];

export default function Expenses() {
  const { user } = useAuth();
  const [category, setCategory] = useState("Makanan");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const expensesQuery = trpc.expenses.list.useQuery(undefined, { enabled: !!user });
  const addExpenseMutation = trpc.expenses.add.useMutation({
    onSuccess: () => {
      expensesQuery.refetch();
      setAmount("");
      setDescription("");
    },
  });

  const expenses = expensesQuery.data || [];
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleAddExpense = () => {
    if (!amount || !category) return;
    addExpenseMutation.mutate({
      category,
      amount: parseFloat(amount),
      description,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Catat Pengeluaran</h1>

        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Tambah Pengeluaran Baru</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kategori</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-2 rounded-lg font-medium transition-colors ${
                      category === cat
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Jumlah (Rp)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Keterangan (Opsional)</label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Makan siang di restoran"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <Button
              onClick={handleAddExpense}
              disabled={addExpenseMutation.isPending || !amount}
              className="bg-blue-600 hover:bg-blue-700 w-full h-12"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pengeluaran
            </Button>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Total Pengeluaran Bulan Ini</h2>
          <p className="text-4xl font-bold text-blue-400">Rp{totalExpenses.toLocaleString("id-ID")}</p>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-2xl font-bold mb-4">Riwayat Pengeluaran</h2>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-slate-400">Belum ada pengeluaran</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{expense.category}</p>
                    <p className="text-sm text-slate-400">{expense.description || "Tanpa keterangan"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">Rp{Number(expense.amount).toLocaleString("id-ID")}</p>
                    <p className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString("id-ID")}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
