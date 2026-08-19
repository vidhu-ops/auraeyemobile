import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Filter, Loader2, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileImportPanel } from "./FileImportPanel";
import { HelpTip } from "./HelpTip";
import { crm } from "./theme";
import type { CrmAccess } from "./types";

type InboxTab = "tickets" | "leads";

export default function InboxWorkspace({
  crmAccess,
  onSelectUser,
}: {
  crmAccess: CrmAccess;
  onSelectUser?: (userId: number) => void;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState<InboxTab>("tickets");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("open");
  const [ticketChannelFilter, setTicketChannelFilter] = useState("all");
  const [ticketForm, setTicketForm] = useState({ subject: "", body: "", priority: "normal" });
  const [leadForm, setLeadForm] = useState({ name: "", email: "", mobileNumber: "", notes: "" });

  const ticketsQuery = useQuery<{ tickets: any[] }>({
    queryKey: ["/api/crm/tickets", ticketStatusFilter, ticketChannelFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (ticketStatusFilter !== "all") params.set("status", ticketStatusFilter);
      if (ticketChannelFilter !== "all") params.set("channel", ticketChannelFilter);
      const res = await apiRequest("GET", `/api/crm/tickets?${params.toString()}`);
      return res.json();
    },
    enabled: !!crmAccess?.canManageTickets && tab === "tickets",
  });

  const leadsQuery = useQuery<{ leads: any[] }>({
    queryKey: ["/api/crm/leads"],
    enabled: !!crmAccess?.canViewUsers && tab === "leads",
  });

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/crm/tickets", ticketForm);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ticket created" });
      setTicketForm({ subject: "", body: "", priority: "normal" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/crm/tickets/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/overview"] });
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/crm/leads", leadForm);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lead added" });
      setLeadForm({ name: "", email: "", mobileNumber: "", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      const res = await apiRequest("PATCH", `/api/crm/leads/${id}`, { stage });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/crm/leads"] }),
  });

  if (!crmAccess.canManageTickets && !crmAccess.canViewUsers) {
    return <p className="text-slate-500">You do not have access to messages or leads.</p>;
  }

  return (
    <div className="space-y-4">
      <div className={crm.sectionBanner}>
        <h2 className="text-lg font-semibold text-indigo-900">Messages & leads</h2>
        <p className={crm.help + " mt-1 text-indigo-800/80"}>
          Customer support and sales prospects in one place. Contact forms, help tickets, feedback, and booking messages
          all land here automatically.
        </p>
      </div>

      <div className="flex gap-2">
        {crmAccess.canManageTickets && (
          <button
            type="button"
            onClick={() => setTab("tickets")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border ${
              tab === "tickets" ? crm.pillActive : crm.pillInactive
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Support inbox
          </button>
        )}
        {crmAccess.canViewUsers && (
          <button
            type="button"
            onClick={() => setTab("leads")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border ${
              tab === "leads" ? crm.pillActive : crm.pillInactive
            }`}
          >
            <Users className="h-4 w-4" />
            Lead pipeline
          </button>
        )}
      </div>

      {tab === "tickets" && crmAccess.canManageTickets && (
        <>
          <HelpTip>
            <strong>Open tickets</strong> need a reply. Click <em>Mark resolved</em> when done. Use filters if the list
            is long.
          </HelpTip>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500">Status:</span>
            {["open", "in_progress", "resolved", "all"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTicketStatusFilter(s)}
                className={`rounded-full px-3 py-1 text-xs border ${
                  ticketStatusFilter === s ? crm.pillActive : crm.pillInactive
                }`}
              >
                {s === "in_progress" ? "In progress" : s === "all" ? "All" : s}
              </button>
            ))}
            <span className="text-slate-500 ml-2">Source:</span>
            {["all", "contact", "help", "feedback", "booking", "crm"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setTicketChannelFilter(c)}
                className={`rounded-full px-3 py-1 text-xs border ${
                  ticketChannelFilter === c ? crm.pillActive : crm.pillInactive
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid xl:grid-cols-3 gap-4">
            <Card className={crm.card}>
              <CardHeader>
                <CardTitle className="text-base">New ticket (manual)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="What is this about?"
                  className={crm.input}
                />
                <textarea
                  value={ticketForm.body}
                  onChange={(e) => setTicketForm({ ...ticketForm, body: e.target.value })}
                  placeholder="Details"
                  className={crm.textarea + " min-h-[100px]"}
                />
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  className={crm.select}
                >
                  <option value="low">Low priority</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <Button className={`w-full ${crm.btnPrimary}`} onClick={() => createTicketMutation.mutate()}>
                  Create ticket
                </Button>
              </CardContent>
            </Card>

            <Card className={`${crm.card} xl:col-span-2`}>
              <CardHeader>
                <CardTitle className="text-base">
                  Inbox ({(ticketsQuery.data?.tickets || []).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[36rem] overflow-y-auto">
                {ticketsQuery.isLoading && (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                )}
                {(ticketsQuery.data?.tickets || []).map((t: any) => (
                  <div key={t.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div className="font-medium">{t.subject}</div>
                      <div className="flex gap-2">
                        {t.status === "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTicketMutation.mutate({ id: t.id, status: "in_progress" })}
                          >
                            Start
                          </Button>
                        )}
                        {t.status !== "resolved" && t.status !== "closed" && (
                          <Button
                            size="sm"
                            className={crm.btnPrimary}
                            onClick={() => updateTicketMutation.mutate({ id: t.id, status: "resolved" })}
                          >
                            Mark resolved
                          </Button>
                        )}
                        {t.userId && onSelectUser && (
                          <Button size="sm" variant="outline" onClick={() => onSelectUser(t.userId)}>
                            View person
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">{t.channel || "crm"}</span>
                      <span>{t.status}</span>
                      {t.requesterName && <span>{t.requesterName}</span>}
                      {t.requesterEmail && <span>{t.requesterEmail}</span>}
                      <span>{t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap">{t.body}</p>
                  </div>
                ))}
                {(ticketsQuery.data?.tickets || []).length === 0 && !ticketsQuery.isLoading && (
                  <p className="text-sm text-slate-500 py-8 text-center">No tickets match your filters. All caught up!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {tab === "leads" && crmAccess.canViewUsers && (
        <>
          <HelpTip>
            Track potential healers from first contact to onboarded. Change the dropdown to move them along the pipeline.
          </HelpTip>
          {crmAccess.canEditUsers && <FileImportPanel target="leads" />}
          <div className="grid xl:grid-cols-3 gap-4">
            <Card className={crm.card}>
              <CardHeader>
                <CardTitle className="text-base">Add a lead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  placeholder="Name"
                  className={crm.input}
                  disabled={!crmAccess.canEditUsers}
                />
                <Input
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  placeholder="Email"
                  className={crm.input}
                  disabled={!crmAccess.canEditUsers}
                />
                <Input
                  value={leadForm.mobileNumber}
                  onChange={(e) => setLeadForm({ ...leadForm, mobileNumber: e.target.value })}
                  placeholder="Mobile"
                  className={crm.input}
                  disabled={!crmAccess.canEditUsers}
                />
                <textarea
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Notes"
                  className={crm.textarea + " min-h-[80px]"}
                  disabled={!crmAccess.canEditUsers}
                />
                {crmAccess.canEditUsers && (
                  <Button className={`w-full ${crm.btnPrimary}`} onClick={() => createLeadMutation.mutate()}>
                    Save lead
                  </Button>
                )}
              </CardContent>
            </Card>
            <Card className={`${crm.card} xl:col-span-2`}>
              <CardHeader>
                <CardTitle className="text-base">Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(leadsQuery.data?.leads || []).map((l: any) => (
                  <div
                    key={l.id}
                    className="rounded-xl border border-slate-200 p-3 flex flex-wrap gap-3 justify-between text-sm"
                  >
                    <div>
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-slate-500">
                        {l.email || "no email"} · {l.mobileNumber || "no mobile"}
                      </div>
                      {l.notes && <p className="text-xs text-slate-600 mt-1">{l.notes}</p>}
                    </div>
                    <select
                      value={l.stage}
                      disabled={!crmAccess.canEditUsers}
                      onChange={(e) => updateLeadMutation.mutate({ id: l.id, stage: e.target.value })}
                      className="rounded-md border border-slate-200 text-xs px-2 h-9 bg-white"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="onboarded">Onboarded</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                ))}
                {(leadsQuery.data?.leads || []).length === 0 && (
                  <p className="text-sm text-slate-500 py-8 text-center">No leads yet — add one or import a spreadsheet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
