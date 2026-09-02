/** Shared light-theme class strings for Admin CRM — mobile-first, flexible layouts */

export const crm = {
  page: "flex flex-col lg:flex-row h-full min-h-0 w-full max-w-[100vw] bg-slate-50 text-slate-900 overflow-hidden",
  aside: "hidden lg:flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-sm shrink-0 min-h-0",
  header: "border-b border-slate-200 bg-white shadow-sm shrink-0 z-20 pt-[max(env(safe-area-inset-top),0px)]",
  main: "flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-6 [-webkit-overflow-scrolling:touch]",
  bottomNav:
    "lg:hidden fixed bottom-0 left-0 right-0 z-[210] border-t border-slate-200 bg-white/98 backdrop-blur supports-[backdrop-filter]:bg-white/90 pb-[max(env(safe-area-inset-bottom),0px)]",
  card: "bg-white border border-slate-200 shadow-sm w-full min-w-0",
  cardMuted: "bg-slate-50 border border-slate-200 w-full min-w-0",
  input: "bg-white border-slate-200 w-full min-w-0",
  select: "w-full min-w-0 rounded-md bg-white border border-slate-200 text-sm px-3 py-2",
  textarea: "w-full min-w-0 rounded-md bg-white border border-slate-200 text-sm px-3 py-2",
  tableHead: "text-left text-slate-500 border-b border-slate-200",
  tableRow: "border-b border-slate-100 hover:bg-slate-50 cursor-pointer",
  tableRowActive: "bg-indigo-50",
  muted: "text-slate-500",
  help: "text-xs text-slate-500 leading-relaxed",
  sectionBanner: "rounded-2xl border border-indigo-200 bg-indigo-50 p-3 sm:p-4 w-full min-w-0",
  pillActive: "bg-indigo-50 border-indigo-200 text-indigo-700",
  pillInactive: "border-slate-200 text-slate-600 hover:bg-slate-50",
  btnPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white",
  overlay: "fixed inset-0 z-[220] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40",
  modal:
    "w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl",
} as const;
