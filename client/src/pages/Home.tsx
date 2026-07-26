import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import Dashboard from "./Dashboard";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-bold text-white mb-4">100 Juta Pertama</h1>
          <p className="text-xl text-slate-300 mb-8">Capai target tabungan Rp100 juta Anda dengan strategi yang realistis dan terukur</p>
          <button
            onClick={() => startLogin()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Mulai Sekarang
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
