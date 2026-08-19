import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { crm } from "./theme";

export type QuickTab = "user" | "healer" | "lead" | "ticket" | "credits";

const TABS: { id: QuickTab; label: string }[] = [
  { id: "user", label: "New client" },
  { id: "healer", label: "New healer" },
  { id: "lead", label: "New lead" },
  { id: "ticket", label: "New ticket" },
  { id: "credits", label: "Add credits" },
];

export default function QuickActionDialog({
  open,
  onClose,
  canEditUsers,
  canEditCredits,
  canManageTickets,
  selectedUserId,
}: {
  open: boolean;
  onClose: () => void;
  canEditUsers?: boolean;
  canEditCredits?: boolean;
  canManageTickets?: boolean;
  selectedUserId?: number | null;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState<QuickTab>("user");
  const [account, setAccount] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    mobileNumber: "",
    credits: "10",
    creditValidityDays: "30",
    specialty: "",
  });
  const [lead, setLead] = useState({ name: "", email: "", mobileNumber: "", notes: "" });
  const [ticket, setTicket] = useState({ subject: "", body: "", priority: "normal" });
  const [credits, setCredits] = useState({ userId: "", amount: "5", creditValidityDays: "30", operation: "add" });

  const createAccount = useMutation({
    mutationFn: async (userType: "client" | "healer" | "semi-healer") => {
      const res = await apiRequest("POST", "/api/crm/users", {
        ...account,
        userType,
        credits: Number(account.credits) || 0,
        creditValidityDays: Number(account.creditValidityDays) || 30,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Created", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
      onClose();
    },
    onError: (err: any) => toast({ title: "Create failed", description: err.message, variant: "destructive" }),
  });

  const createLead = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/crm/leads", lead);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lead added" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      onClose();
    },
    onError: (err: any) => toast({ title: "Lead failed", description: err.message, variant: "destructive" }),
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/crm/tickets", {
        ...ticket,
        userId: selectedUserId || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ticket created" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/tickets"] });
      onClose();
    },
    onError: (err: any) => toast({ title: "Ticket failed", description: err.message, variant: "destructive" }),
  });

  const adjustCredits = useMutation({
    mutationFn: async () => {
      const id = Number(credits.userId || selectedUserId);
      if (!id) throw new Error("Enter a user ID");
      const res = await apiRequest("POST", `/api/crm/users/${id}/credits`, {
        amount: credits.amount,
        operation: credits.operation,
        creditValidityDays: Number(credits.creditValidityDays) || 30,
        description: `Quick Action ${credits.operation}`,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Credits updated", description: `Balance ${data.creditsAfter}` });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/users"] });
      onClose();
    },
    onError: (err: any) => toast({ title: "Credits failed", description: err.message, variant: "destructive" }),
  });

  if (!open) return null;

  const validitySelect = (value: string, onChange: (v: string) => void) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={crm.select}>
      <option value="3">3 days</option>
      <option value="30">1 month</option>
      <option value="60">2 months</option>
      <option value="90">3 months</option>
      <option value="180">6 months</option>
    </select>
  );

  return (
    <div className={crm.overlay} onClick={onClose}>
      <div className={crm.modal} onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-600" /> Quick action
          </div>
          <button type="button" className="text-slate-500 hover:text-slate-900 text-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto px-3 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs border ${
                tab === t.id ? crm.pillActive : crm.pillInactive
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {(tab === "user" || tab === "healer") && (
            <>
              <Input placeholder="Username *" value={account.username} onChange={(e) => setAccount({ ...account, username: e.target.value })} className={crm.input} />
              <Input type="password" placeholder="Password *" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} className={crm.input} />
              <Input placeholder="Display name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} className={crm.input} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Credits" value={account.credits} onChange={(e) => setAccount({ ...account, credits: e.target.value })} className={crm.input} />
                {validitySelect(account.creditValidityDays, (v) => setAccount({ ...account, creditValidityDays: v }))}
              </div>
              <Button className={`w-full ${crm.btnPrimary}`} disabled={!canEditUsers || createAccount.isPending} onClick={() => createAccount.mutate(tab === "healer" ? "healer" : "client")}>
                {createAccount.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Create ${tab}`}
              </Button>
            </>
          )}
          {tab === "lead" && (
            <>
              <Input placeholder="Name *" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} className={crm.input} />
              <Input placeholder="Email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} className={crm.input} />
              <Button className={`w-full ${crm.btnPrimary}`} disabled={!canEditUsers || createLead.isPending} onClick={() => createLead.mutate()}>
                Add lead
              </Button>
            </>
          )}
          {tab === "ticket" && (
            <>
              <Input placeholder="Subject *" value={ticket.subject} onChange={(e) => setTicket({ ...ticket, subject: e.target.value })} className={crm.input} />
              <textarea placeholder="Details *" value={ticket.body} onChange={(e) => setTicket({ ...ticket, body: e.target.value })} className={crm.textarea + " min-h-[100px]"} />
              <Button className={`w-full ${crm.btnPrimary}`} disabled={!canManageTickets || createTicket.isPending} onClick={() => createTicket.mutate()}>
                Create ticket
              </Button>
            </>
          )}
          {tab === "credits" && (
            <>
              <Input placeholder={selectedUserId ? `User ID (selected: ${selectedUserId})` : "User ID *"} value={credits.userId} onChange={(e) => setCredits({ ...credits, userId: e.target.value })} className={crm.input} />
              <Input type="number" placeholder="Amount" value={credits.amount} onChange={(e) => setCredits({ ...credits, amount: e.target.value })} className={crm.input} />
              {validitySelect(credits.creditValidityDays, (v) => setCredits({ ...credits, creditValidityDays: v }))}
              <Button className={`w-full ${crm.btnPrimary}`} disabled={!canEditCredits || adjustCredits.isPending} onClick={() => adjustCredits.mutate()}>
                Update credits
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
