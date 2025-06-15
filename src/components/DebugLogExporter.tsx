
import { useState } from "react";
import { logger } from "@/utils/logger";
import { FileDown, Trash2 } from "lucide-react";

const DebugLogExporter = () => {
  const [show, setShow] = useState(false);

  // Only show in dev or by holding corner tap (or adjust per sua preferência)
  // Aqui deixaremos visível sempre para debug
  const handleExport = () => {
    const logs = logger.exportLogs();
    // Baixar como arquivo .json
    const blob = new Blob([logs], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `superleitor-debug-log-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-3 right-2 z-[999999] flex flex-col gap-2">
      <button
        className="p-2 bg-black/70 text-white rounded-full shadow-md flex items-center hover:bg-black/90 transition border border-white focus:outline-none"
        aria-label="Exportar logs debug"
        title="Exportar logs debug"
        onClick={handleExport}
      >
        <FileDown className="w-5 h-5" />
        <span className="ml-2 text-xs font-bold hidden md:inline">Exportar Log</span>
      </button>
      <button
        className="p-2 bg-black/30 text-white rounded-full shadow-md flex items-center hover:bg-red-500/70 border border-white transition focus:outline-none"
        aria-label="Limpar logs debug"
        title="Limpar logs debug"
        onClick={() => { logger.clear(); window.location.reload(); }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DebugLogExporter;
