import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type QuickTab = "user" | "healer" | "lead" | "ticket" | "credits";

const TABS: { id: QuickTab; label: string }[] = [
  { id: "user", label: "New user" },
  { id: "healer", label: "New healer" },
  { id: "lead", label: "New lead" },
  { id: "ticket", label: "New ticket" },
  { id: "credits", label: "Credits" },
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
      queryClient.invalidateQueries({ queryKey: ["/api/crm/healers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
      setAccount({
        username: "",
        password: "",
        name: "",
        email: "",
        mobileNumber: "",
        credits: "10",
        creditValidityDays: "30",
        specialty: "",
      });
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
      setLead({ name: "", email: "", mobileNumber: "", notes: "" });
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
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
      setTicket({ subject: "", body: "", priority: "normal" });
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md bg-slate-50 border border-slate-200 text-sm px-3 py-2"
    >
      <option value="3">3 days</option>
      <option value="30">1 month</option>
      <option value="60">2 months</option>
      <option value="90">3 months</option>
      <option value="180">6 months</option>
    </select>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-600" /> Quick Action
          </div>
          <button className="text-slate-400 hover:text-slate-900 text-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto px-3 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs border ${
                tab === t.id ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "border-slate-200 text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {(tab === "user" || tab === "healer") && (
            <>
              {!canEditUsers && <p className="text-xs text-amber-800">You need edit permission to create accounts.</p>}
              <Input
                placeholder="Username *"
                value={account.username}
                onChange={(e) => setAccount({ ...account, username: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
              <Input
                type="password"
                placeholder="Password *"
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
              <Input
                placeholder="Display name"
                value={account.name}
                onChange={(e) => setAccount({ ...account, name: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
              <Input
                placeholder="Email"
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Credits"
                  value={account.credits}
                  onChange={(e) => setAccount({ ...account, credits: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                />
                {validitySelect(account.creditValidityDays, (v) => setAccount({ ...account, creditValidityDays: v }))}
              </div>
              {tab === "healer" && (
                <Input
                  placeholder="Specialty"
                  value={account.specialty}
                  onChange={(e) => setAccount({ ...account, specialty: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                />
              )}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-500"
                disabled={!canEditUsers || createAccount.isPending}
                onClick={() => createAccount.mutate(tab === "healer" ? "healer" : "client")}
              >
                {createAccount.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Create ${tab}`}
              </Button>
            </>
          )}

          {tab === "lead" && (
            <>
              {!canEditUsers && <p className="text-xs text-amber-800">You need edit permission to add leads.</p>}
              <Input
                placeholder="Name *"
                value={lead.name}
                onChange={(e) => setLead({ ...lead, name: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
              <Input
                placeholder="Email"
                value={lead.email}
                onChange={(e) => setLead({ ...lead, email: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
              <Input
                placeholder="Mobile"
                value={lead.mobileNumber}
                onChange={(e) => setLead({ ...lead, mobileNumber: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
              <textarea
                placeholder="Notes"
                value={lead.notes}
                onChange={(e) => setLead({ ...lead, notes: e.target.value })}
                className="w-full min-h-[80px] rounded-md bg-slate-50 border border-slate-200 text-sm px-3 py-2"
              />
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-500"
                disabled={!canEditUsers || createLead.isPending}
                onClick={() => createLead.mutate()}
              >
                {createLead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add lead"}
              </Button>
            </>
          )}

          {tab === "ticket" && (
            <>
              {!canManageTickets && <p className="text-xs text-amber-800">You need ticket permission.</p>}
              <Input
                placeholder="Subject *"
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
              <textarea
                placeholder="Details *"
                value={ticket.body}
                onChange={(e) => setTicket({ ...ticket, body: e.target.value })}
                className="w-full min-h-[100px] rounded-md bg-slate-50 border border-slate-200 text-sm px-3 py-2"
              />
              <select
                value={ticket.priority}
                onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}
                className="w-full rounded-md bg-slate-50 border border-slate-200 text-sm px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <p className="text-[11px] text-slate-500">
                {selectedUserId ? `Will link to selected user #${selectedUserId}` : "No user linked (optional)"}
              </p>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-500"
                disabled={!canManageTickets || createTicket.isPending}
                onClick={() => createTicket.mutate()}
              >
                {createTicket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create ticket"}
              </Button>
            </>
          )}

          {tab === "credits" && (
            <>
              {!canEditCredits && <p className="text-xs text-amber-800">You need credit permission.</p>}
              <Input
                placeholder={selectedUserId ? `User ID (selected: ${selectedUserId})` : "User ID *"}
                value={credits.userId}
                onChange={(e) => setCredits({ ...credits, userId: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
              <Input
                type="number"
                placeholder="Amount"
                value={credits.amount}
                onChange={(e) => setCredits({ ...credits, amount: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
              <select
                value={credits.operation}
                onChange={(e) => setCredits({ ...credits, operation: e.target.value })}
                className="w-full rounded-md bg-slate-50 border border-slate-200 text-sm px-3 py-2"
              >
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
                <option value="set">Set</option>
              </select>
              {validitySelect(credits.creditValidityDays, (v) => setCredits({ ...credits, creditValidityDays: v }))}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-500"
                disabled={!canEditCredits || adjustCredits.isPending}
                onClick={() => adjustCredits.mutate()}
              >
                {adjustCredits.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update credits"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
