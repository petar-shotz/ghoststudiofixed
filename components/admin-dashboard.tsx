"use client";

import { useState } from "react";
import {
  Inbox,
  Clock,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Trash2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Lead {
  id: string;
  reference: string;
  created_at: number;
  status: "new" | "contacted" | "in-progress" | "archived" | string;
  notification_status: "pending" | "sent" | "failed" | string;
  notification_error?: string | null;
  notification_attempts: number;
  last_notification_at?: number | null;
  contact_name: string;
  email: string;
  phone?: string | null;
  website_name?: string | null;
  project_type: string;
  description: string;
  design_style: string;
  color_palette: string;
  navigation: string;
  pages: string;
  extra_pages?: string | null;
  features: string;
  custom_requirements?: string | null;
  budget: string;
  timeline: string;
  provided_assets: string;
  inspiration?: string | null;
  privacy_consent: boolean;
}

export default function AdminDashboard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function parseJsonList(val: string): string[] {
    try {
      const p = JSON.parse(val);
      if (Array.isArray(p)) return p;
    } catch {}
    return val ? [val] : [];
  }

  const filteredLeads = leads.filter((lead) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lead.reference.toLowerCase().includes(q) ||
      lead.contact_name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      (lead.website_name && lead.website_name.toLowerCase().includes(q)) ||
      lead.description.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesNotification = notificationFilter === "all" || lead.notification_status === notificationFilter;

    return matchesSearch && matchesStatus && matchesNotification;
  });

  const failedCount = leads.filter((l) => l.notification_status === "failed").length;
  const newCount = leads.filter((l) => l.status === "new").length;

  async function handleRetry(briefId: string) {
    setRetryingId(briefId);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry_notification", briefId }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Retry attempt failed");
      }

      setLeads((prev) =>
        prev.map((l) => (l.id === briefId ? { ...l, notification_status: "sent", notification_error: null, notification_attempts: (l.notification_attempts || 0) + 1, last_notification_at: Date.now() } : l))
      );

      if (selectedLead?.id === briefId) {
        setSelectedLead((prev) => (prev ? { ...prev, notification_status: "sent", notification_error: null, notification_attempts: (prev.notification_attempts || 0) + 1, last_notification_at: Date.now() } : null));
      }

      setActionMessage({ type: "success", text: "Notification successfully sent to p8339378@gmail.com!" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to deliver notification";
      setActionMessage({ type: "error", text: errMsg });
      setLeads((prev) =>
        prev.map((l) => (l.id === briefId ? { ...l, notification_status: "failed", notification_error: errMsg, notification_attempts: (l.notification_attempts || 0) + 1 } : l))
      );
    } finally {
      setRetryingId(null);
    }
  }

  async function handleStatusChange(briefId: string, newStatus: string) {
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", briefId, status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === briefId ? { ...l, status: newStatus } : l)));
        if (selectedLead?.id === briefId) {
          setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  }

  async function handleDelete(briefId: string) {
    if (!confirm("Are you sure you want to delete this enquiry? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_lead", briefId }),
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== briefId));
        if (selectedLead?.id === briefId) setSelectedLead(null);
        setActionMessage({ type: "success", text: "Enquiry removed." });
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  return (
    <div className="space-y-8">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card/60 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Enquiries</span>
          <div className="text-2xl font-bold mt-1">{leads.length}</div>
        </div>
        <div className="p-4 rounded-xl border bg-card/60 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New (Unreviewed)</span>
          <div className="text-2xl font-bold mt-1 text-primary-foreground">
            <span className="inline-block bg-[#d8c9f6] text-[#1a1a18] px-2 py-0.5 rounded-md text-xl">{newCount}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card/60 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Delivery Failures</span>
          <div className="text-2xl font-bold mt-1">
            {failedCount > 0 ? (
              <span className="text-rose-600 flex items-center gap-1.5 text-xl font-semibold">
                <AlertCircle size={20} /> {failedCount} need retry
              </span>
            ) : (
              <span className="text-emerald-700 text-base font-normal flex items-center gap-1">
                <CheckCircle2 size={16} /> All delivered
              </span>
            )}
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card/60 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notification Target</span>
          <div className="text-sm font-semibold mt-2 text-foreground/90 truncate">p8339378@gmail.com</div>
        </div>
      </div>

      {/* Action alert message */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-lg text-sm flex items-center justify-between ${
            actionMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button type="button" onClick={() => setActionMessage(null)} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, brand, reference or keyword..."
            className="pl-9 studio-input"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter size={14} /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border rounded-md px-2.5 py-1.5 bg-background"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in-progress">In progress</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={notificationFilter}
            onChange={(e) => setNotificationFilter(e.target.value)}
            className="text-xs border rounded-md px-2.5 py-1.5 bg-background"
          >
            <option value="all">All notifications</option>
            <option value="sent">Delivered</option>
            <option value="failed">Failed delivery</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Inbox size={36} className="mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-lg font-medium">No matching briefs found</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
            {search || statusFilter !== "all" || notificationFilter !== "all"
              ? "Try adjusting your search or filters to see more enquiries."
              : "When clients complete the 5-step planner at /start, their enquiries will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => {
            return (
              <div
                key={lead.id}
                className="bg-card border rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group text-left"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-base text-foreground line-clamp-1">{lead.contact_name}</h3>
                      <span className="text-xs text-muted-foreground font-mono">{lead.reference}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {lead.status === "new" ? (
                        <span className="text-[11px] font-semibold bg-[#effa82] text-[#1a1a18] px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full capitalize">
                          {lead.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Brand & Project Info */}
                  <div className="space-y-1.5 text-xs text-foreground/80 mb-3">
                    <div className="font-medium text-foreground">
                      {lead.website_name ? lead.website_name : "Unnamed project"} ·{" "}
                      <span className="text-muted-foreground font-normal">{lead.project_type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{lead.budget}</span>
                      <span>·</span>
                      <span>{lead.timeline}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 italic bg-muted/40 p-2.5 rounded-md mb-3">
                    &ldquo;{lead.description}&rdquo;
                  </p>
                </div>

                <div className="border-t pt-3 space-y-2">
                  {/* Notification Status Row */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Notification:</span>
                    {lead.notification_status === "sent" ? (
                      <span className="text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 size={13} /> Delivered
                      </span>
                    ) : lead.notification_status === "failed" ? (
                      <span className="text-rose-600 flex items-center gap-1 font-medium" title={lead.notification_error || ""}>
                        <AlertCircle size={13} /> Failed
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1 font-medium">
                        <Clock size={13} /> Pending
                      </span>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 gap-1"
                      onClick={() => setSelectedLead(lead)}
                    >
                      View full brief <ChevronRight size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL BRIEF DETAIL MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b flex items-start justify-between bg-muted/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded font-semibold text-foreground">
                    {selectedLead.reference}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Received {new Date(selectedLead.created_at).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  {selectedLead.contact_name} {selectedLead.website_name && `(${selectedLead.website_name})`}
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLead(null)} className="h-8 w-8 p-0 rounded-full">
                ✕
              </Button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Notification Status Banner & Retry */}
              <div className="p-4 rounded-xl border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Notification</div>
                  <div className="flex items-center gap-2">
                    {selectedLead.notification_status === "sent" ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={16} /> Delivered to p8339378@gmail.com
                      </span>
                    ) : selectedLead.notification_status === "failed" ? (
                      <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                        <AlertCircle size={16} /> Delivery Failed
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                        <Clock size={16} /> Pending Delivery
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ({selectedLead.notification_attempts} attempt{selectedLead.notification_attempts !== 1 ? "s" : ""})
                    </span>
                  </div>
                  {selectedLead.notification_error && (
                    <p className="text-xs text-rose-600 mt-1 bg-rose-50 p-2 rounded border border-rose-200">
                      Reason: {selectedLead.notification_error}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={retryingId === selectedLead.id}
                  onClick={() => handleRetry(selectedLead.id)}
                  className="shrink-0 gap-1.5 text-xs bg-background"
                >
                  <RefreshCw size={13} className={retryingId === selectedLead.id ? "animate-spin" : ""} />
                  {selectedLead.notification_status === "sent" ? "Resend to email" : "Retry notification"}
                </Button>
              </div>

              {/* Client Contact Info */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Information</h3>
                <div className="grid sm:grid-cols-3 gap-3 p-3.5 rounded-lg border bg-card">
                  <div>
                    <span className="text-xs text-muted-foreground block">Name</span>
                    <span className="font-medium text-foreground">{selectedLead.contact_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Email</span>
                    <a
                      href={`mailto:${selectedLead.email}?subject=Regarding your Ghost Studio brief (${selectedLead.reference})`}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail size={13} /> {selectedLead.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Phone</span>
                    {selectedLead.phone ? (
                      <a href={`tel:${selectedLead.phone}`} className="font-medium hover:underline flex items-center gap-1">
                        <Phone size={13} /> {selectedLead.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </div>
                </div>
              </section>

              {/* Project Overview */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Description</h3>
                <div className="p-4 rounded-lg border bg-card text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedLead.description}
                </div>
              </section>

              {/* Design & Specifications */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Design & Structure</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-xs text-muted-foreground block">Website Type</span>
                    <span className="font-medium">{selectedLead.project_type}</span>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-xs text-muted-foreground block">Design Style & Palette</span>
                    <span className="font-medium">
                      {selectedLead.design_style} · {selectedLead.color_palette}
                    </span>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-xs text-muted-foreground block">Navigation Preference</span>
                    <span className="font-medium">{selectedLead.navigation}</span>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-xs text-muted-foreground block">Planning Budget & Timeline</span>
                    <span className="font-medium">
                      {selectedLead.budget} · {selectedLead.timeline}
                    </span>
                  </div>
                </div>
              </section>

              {/* Pages & Features */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scope & Features</h3>
                <div className="p-3.5 border rounded-lg bg-card space-y-2.5">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Selected Pages / Sections</span>
                    <div className="flex flex-wrap gap-1.5">
                      {parseJsonList(selectedLead.pages).map((p) => (
                        <span key={p} className="text-xs bg-muted px-2 py-0.5 rounded font-medium">
                          {p}
                        </span>
                      ))}
                      {selectedLead.extra_pages && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                          + {selectedLead.extra_pages}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <span className="text-xs text-muted-foreground block mb-1">Features Requested</span>
                    <div className="flex flex-wrap gap-1.5">
                      {parseJsonList(selectedLead.features).length > 0 ? (
                        parseJsonList(selectedLead.features).map((f) => (
                          <span key={f} className="text-xs bg-[#effa82]/60 text-foreground border px-2 py-0.5 rounded font-medium">
                            {f}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No extra features selected</span>
                      )}
                    </div>
                  </div>

                  {selectedLead.custom_requirements && (
                    <div className="border-t pt-2">
                      <span className="text-xs text-muted-foreground block mb-1">Custom Requirements</span>
                      <p className="text-xs bg-muted/40 p-2.5 rounded whitespace-pre-wrap">{selectedLead.custom_requirements}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Assets & Inspiration */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assets & Inspiration</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-xs text-muted-foreground block mb-1">Assets Ready</span>
                    <div className="flex flex-wrap gap-1">
                      {parseJsonList(selectedLead.provided_assets).length > 0 ? (
                        parseJsonList(selectedLead.provided_assets).map((a) => (
                          <span key={a} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Starting from scratch</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-card">
                    <span className="text-xs text-muted-foreground block mb-1">Inspiration Links / Notes</span>
                    <p className="text-xs text-foreground/80">{selectedLead.inspiration || "None provided"}</p>
                  </div>
                </div>
              </section>

              {/* Status Update & Delete Controls */}
              <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Enquiry Status:</span>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                    className="text-xs border rounded px-2.5 py-1.5 bg-background font-medium"
                  >
                    <option value="new">New (Unreviewed)</option>
                    <option value="contacted">Contacted</option>
                    <option value="in-progress">In Progress</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs gap-1"
                  onClick={() => handleDelete(selectedLead.id)}
                >
                  <Trash2 size={14} /> Delete enquiry
                </Button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-muted/20 flex justify-end">
              <Button onClick={() => setSelectedLead(null)} className="button button-dark text-xs h-9">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
