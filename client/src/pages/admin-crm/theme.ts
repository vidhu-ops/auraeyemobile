/** Shared light-theme class strings for Admin CRM */

export const crm = {
  page: "min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col lg:flex-row",
  aside: "hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white shadow-sm shrink-0",
  header: "border-b border-slate-200 bg-white shadow-sm sticky top-0 z-20 pt-[env(safe-area-inset-top)]",
  main: "flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-6",
  bottomNav:
    "lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]",
  card: "bg-white border-slate-200 shadow-sm",
  cardMuted: "bg-slate-50 border-slate-200",
  input: "bg-white border-slate-200",
  select: "w-full rounded-md bg-white border border-slate-200 text-sm px-3 py-2",
  textarea: "w-full rounded-md bg-white border border-slate-200 text-sm px-3 py-2",
  tableHead: "text-left text-slate-500 border-b border-slate-200",
  tableRow: "border-b border-slate-100 hover:bg-slate-50 cursor-pointer",
  tableRowActive: "bg-indigo-50",
  muted: "text-slate-500",
  help: "text-xs text-slate-500 leading-relaxed",
  sectionBanner: "rounded-2xl border border-indigo-200 bg-indigo-50 p-4",
  pillActive: "bg-indigo-50 border-indigo-200 text-indigo-700",
  pillInactive: "border-slate-200 text-slate-600 hover:bg-slate-50",
  btnPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white",
  overlay: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40",
  modal: "w-full max-w-xl rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl",
} as const;
