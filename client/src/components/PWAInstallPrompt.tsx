import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-xs z-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Instal 100 Juta Pertama</p>
            <p className="text-sm text-blue-100">Akses aplikasi langsung dari layar utama Anda</p>
          </div>
        </div>
        <button onClick={() => setShowPrompt(false)} className="flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          onClick={handleInstall}
          className="bg-white text-blue-600 hover:bg-blue-50 flex-1 h-8 text-sm"
        >
          Instal
        </Button>
        <Button
          onClick={() => setShowPrompt(false)}
          variant="outline"
          className="border-blue-400 text-white hover:bg-blue-700 flex-1 h-8 text-sm"
        >
          Nanti
        </Button>
      </div>
    </div>
  );
}
