import { HelpCircle } from "lucide-react";

export function HelpTip({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
      <HelpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-500" />
      <span>{children}</span>
    </p>
  );
}

export function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
        {n}
      </span>
      {children}
    </div>
  );
}
