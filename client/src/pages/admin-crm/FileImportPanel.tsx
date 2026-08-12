import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type ImportTarget = "users" | "leads";

const TEMPLATES: Record<ImportTarget, { headers: string[]; sample: Record<string, string | number>[] }> = {
  users: {
    headers: ["username", "password", "name", "email", "mobileNumber", "userType", "credits", "creditValidityDays"],
    sample: [
      {
        username: "jane_client",
        password: "ChangeMe123",
        name: "Jane Client",
        email: "jane@example.com",
        mobileNumber: "",
        userType: "client",
        credits: 10,
        creditValidityDays: 30,
      },
    ],
  },
  leads: {
    headers: ["name", "email", "mobileNumber", "source", "stage", "notes"],
    sample: [
      {
        name: "Prospective Healer",
        email: "healer@example.com",
        mobileNumber: "",
        source: "csv_import",
        stage: "new",
        notes: "",
      },
    ],
  },
};

export function FileImportPanel({
  target,
  disabled,
  onImported,
}: {
  target: ImportTarget;
  disabled?: boolean;
  onImported?: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const downloadTemplate = () => {
    const tpl = TEMPLATES[target];
    const ws = XLSX.utils.json_to_sheet(tpl.sample, { header: tpl.headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, target);
    XLSX.writeFile(wb, `auraeye-${target}-import-template.xlsx`);
  };

  const parseFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, unknown>[];
    return rows;
  };

  const onFile = async (file: File | null) => {
    if (!file || disabled) return;
    setBusy(true);
    setLastResult(null);
    try {
      const rows = await parseFile(file);
      if (!rows.length) throw new Error("No rows found in file");
      const endpoint = target === "users" ? "/api/crm/users/import" : "/api/crm/leads/import";
      const res = await apiRequest("POST", endpoint, { rows });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Import failed");
      const msg = `Created ${json.created} of ${json.total}`;
      setLastResult(msg);
      toast({ title: "Import complete", description: msg });
      queryClient.invalidateQueries({ queryKey: [target === "users" ? "/api/crm/users" : "/api/crm/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/healers"] });
      onImported?.();
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
      <div className="text-sm font-medium flex items-center gap-2">
        <Upload className="h-4 w-4 text-sky-300" />
        Upload CSV / XLS ({target})
      </div>
      <p className="text-[11px] text-slate-400">
        Columns: {TEMPLATES[target].headers.join(", ")}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="border-white/15" onClick={downloadTemplate} disabled={disabled}>
          Download template
        </Button>
        <label className={`inline-flex items-center ${disabled || busy ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            disabled={disabled || busy}
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
          <span className="inline-flex h-8 items-center rounded-md border border-white/15 px-3 text-xs hover:bg-white/5">
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Importing…
              </>
            ) : (
              "Choose file"
            )}
          </span>
        </label>
      </div>
      {lastResult && <p className="text-xs text-emerald-300">{lastResult}</p>}
    </div>
  );
}
