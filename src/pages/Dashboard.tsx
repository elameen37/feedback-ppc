import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/icpc/Header";
import Footer from "@/components/icpc/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { LogOut, Search, FileDown, Filter, Clock, Eye, Activity, CheckCircle2, AlertCircle, Inbox, TrendingUp, Shield } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { sendNotification } from "@/lib/notifications";

type Complaint = Tables<"complaints">;
type AuditLog = Tables<"audit_logs">;

const statusColors: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-600 border-blue-200",
  under_review: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  assigned: "bg-purple-500/10 text-purple-600 border-purple-200",
  responded: "bg-green-500/10 text-green-600 border-green-200",
  closed: "bg-muted/50 text-muted-foreground border-border",
};

const categoryLabels: Record<string, string> = {
  corruption: "Corruption",
  abuse_of_office: "Abuse of Office",
  misconduct: "Misconduct",
  policy_suggestion: "Policy Suggestion",
  public_service_concern: "Public Service",
  anti_corruption_idea: "Anti-Corruption Idea",
  observation: "Observation",
  self_report_officer: "Self-Report (Officer)",
  self_report_individual: "Self-Report (Individual)",
  self_report_organization: "Self-Report (Org)",
};

const Dashboard = () => {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setComplaints(data);
    setLoading(false);
  };

  const fetchAuditLogs = async (complaintId: string) => {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("complaint_id", complaintId)
      .order("created_at", { ascending: true });
    setAuditLogs(data ?? []);
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    fetchAuditLogs(complaint.id);
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || newStatus === selectedComplaint.status) return;
    const { error } = await supabase
      .from("complaints")
      .update({ status: newStatus as Complaint["status"] })
      .eq("id", selectedComplaint.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Send status change notification
      sendNotification({
        type: "status_change",
        complaint_id: selectedComplaint.id,
        tracking_id: selectedComplaint.tracking_id,
        category: selectedComplaint.category,
        old_status: selectedComplaint.status,
        new_status: newStatus,
        submitter_email: selectedComplaint.submitter_contact?.includes("@")
          ? selectedComplaint.submitter_contact
          : undefined,
      });
      toast({ title: "Status Updated", description: `Complaint ${selectedComplaint.tracking_id} updated to ${newStatus}.` });
      setSelectedComplaint({ ...selectedComplaint, status: newStatus as Complaint["status"] });
      fetchComplaints();
      fetchAuditLogs(selectedComplaint.id);
    }
  };

  const exportCSV = () => {
    const headers = ["Tracking ID", "Category", "Status", "Submission Type", "Anonymous", "Date"];
    const rows = filtered.map(c => [
      c.tracking_id, c.category, c.status, c.submission_type, c.anonymous ? "Yes" : "No",
      new Date(c.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `icpc-complaints-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = complaints.filter(c => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (searchQuery && !c.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // SLA: complaints older than 14 days still in "submitted" status
  const getSLAWarning = (c: Complaint) => {
    const age = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (c.status === "submitted" && age > 14) return "Overdue";
    if (c.status === "under_review" && age > 30) return "Overdue";
    return null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
            <p className="text-muted-foreground font-sans font-medium tracking-widest uppercase text-xs">Synchronizing Portal...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />
      <main className="flex-1 py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10 pointer-events-none" />
        
        <div className="container max-w-7xl relative z-10">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 animate-reveal">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
                  {role === "admin" ? "Admin" : "Officer"} Core
                </h1>
              </div>
              <p className="text-sm text-muted-foreground font-sans max-w-md">
                Managing <span className="text-primary font-bold">{complaints.length}</span> security reports. 
                SLA compliance is currently at <span className="text-accent font-bold">94%</span>.
              </p>
            </div>
            
            <div className="flex items-center gap-3 p-1 glass-card border-white/10 rounded-2xl">
              <Button variant="ghost" size="sm" className="font-sans gap-2 hover:bg-white/10" onClick={exportCSV}>
                <FileDown className="h-4 w-4" /> Export
              </Button>
              <div className="h-4 w-px bg-white/10" />
              <Button variant="ghost" size="sm" className="font-sans gap-2 text-destructive hover:bg-destructive/10" onClick={signOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
            {/* Total Reports - Large Feature Card */}
            <Card className="md:col-span-2 lg:col-span-2 glass-card border-white/10 overflow-hidden relative group animate-reveal stagger-1">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-24 w-24 text-accent" />
              </div>
              <CardContent className="pt-8 pb-6 bg-gradient-to-br from-primary/5 to-accent/5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Traffic</p>
                <p className="text-5xl font-black text-primary mb-2 tracking-tighter">{complaints.length}</p>
                <div className="flex items-center gap-2 text-xs font-sans text-green-600 font-bold">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats - Grid */}
            {[
              { label: "Pending", val: "submitted", icon: Inbox, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Reviewing", val: "under_review", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
              { label: "Assigned", val: "assigned", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
              { label: "Resolved", val: "responded", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" }
            ].map((s, idx) => (
              <Card key={s.val} 
                    className={`glass-card border-white/10 cursor-pointer hover:border-accent/30 transition-all group animate-reveal stagger-${idx+2}`}
                    onClick={() => setFilterStatus(s.val === filterStatus ? "all" : s.val)}>
                <CardContent className="pt-6 pb-4 text-center">
                  <div className={`mx-auto h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <p className="text-xl font-bold text-primary group-hover:text-accent transition-colors">
                    {complaints.filter(c => c.status === s.val).length}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-wider">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Controls & Table Container */}
          <div className="glass-card border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-reveal stagger-4">
            {/* Table Controls */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input placeholder="Filter by Tracking ID or keywords..." 
                       className="pl-11 h-12 bg-black/10 border-white/5 rounded-xl font-sans text-sm focus-visible:ring-accent"
                       value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full lg:w-56 h-12 bg-black/10 border-white/5 rounded-xl font-sans text-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Main Data Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/20 backdrop-blur-md">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="font-sans uppercase text-[10px] font-bold tracking-widest py-5">Intel ID</TableHead>
                    <TableHead className="font-sans uppercase text-[10px] font-bold tracking-widest py-5">Category</TableHead>
                    <TableHead className="font-sans uppercase text-[10px] font-bold tracking-widest py-5 text-center">Security Status</TableHead>
                    <TableHead className="font-sans uppercase text-[10px] font-bold tracking-widest py-5">Source</TableHead>
                    <TableHead className="font-sans uppercase text-[10px] font-bold tracking-widest py-5 text-center">Priority / SLA</TableHead>
                    <TableHead className="font-sans uppercase text-[10px] font-bold tracking-widest py-5 text-right px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow className="border-white/5">
                      <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-sans">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <Inbox className="h-12 w-12" />
                          <p className="font-medium">No archived records match your current filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filtered.map(c => {
                    const sla = getSLAWarning(c);
                    return (
                      <TableRow key={c.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell className="font-mono text-xs font-bold text-primary group-hover:text-accent transition-colors">{c.tracking_id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-sans font-medium text-foreground">{categoryLabels[c.category] ?? c.category}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">{new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest py-1 px-3 border-white/10 ${statusColors[c.status] ?? ""}`}>
                            {c.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-sans text-muted-foreground capitalize">{c.submission_type}</TableCell>
                        <TableCell className="text-center">
                          {sla ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-tighter animate-pulse">
                              <AlertCircle className="h-3 w-3" /> Overdue
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-tighter">
                              <Shield className="h-3 w-3" /> Secure
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Button variant="ghost" size="sm" 
                                  className="h-8 w-8 rounded-full p-0 hover:bg-accent/10 hover:text-accent transition-all" 
                                  onClick={() => handleViewComplaint(c)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(v) => !v && setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 glass-card border-white/20 shadow-2xl rounded-3xl">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-accent opacity-50" />
          
          <DialogHeader className="p-8 pb-4 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-3 mb-1">
              <Shield className="h-5 w-5 text-accent" />
              <DialogTitle className="text-2xl font-bold text-primary tracking-tight">
                Case File: <span className="font-mono text-accent">{selectedComplaint?.tracking_id}</span>
              </DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground font-sans uppercase tracking-widest font-bold">
              ICPC Central Intelligence Repository
            </p>
          </DialogHeader>

          {selectedComplaint && (
            <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
              {/* Meta Data Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/10 border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Classification</p>
                  <p className="text-sm font-sans font-medium text-primary">{categoryLabels[selectedComplaint.category]}</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/10 border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Encryption Source</p>
                  <p className="text-sm font-sans font-medium capitalize">{selectedComplaint.submission_type} Portal</p>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-accent rounded-full" />
                  <Label className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Incident Narrative</Label>
                </div>
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <FileDown className="h-12 w-12" />
                  </div>
                  <p className="text-sm font-sans leading-relaxed text-foreground whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>
              </div>

              {/* Submitter Info (if not anonymous) */}
              {!selectedComplaint.anonymous && (
                <div className="space-y-3">
                  <Label className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Source Identity</Label>
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Affiliation / Name</p>
                      <p className="text-xs font-medium">{selectedComplaint.submitter_name || "Confidential"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Contact Channel</p>
                      <p className="text-xs font-medium truncate">{selectedComplaint.submitter_contact || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Command Center: Status Update */}
              {(role === "admin" || role === "officer") && (
                <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-sans text-xs font-bold uppercase tracking-widest text-accent">Status Protocol</Label>
                    <Badge variant="outline" className="text-[10px] border-accent/20 text-accent uppercase font-bold tracking-tighter">Current: {selectedComplaint.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex gap-3">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="flex-1 h-11 bg-white/5 border-white/10 rounded-xl font-sans text-sm focus:ring-accent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        {["submitted", "under_review", "assigned", "responded", "closed"].map(s => (
                          <SelectItem key={s} value={s} className="capitalize text-sm">{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleUpdateStatus} 
                            disabled={newStatus === selectedComplaint.status} 
                            className="bg-accent hover:bg-accent/90 text-white font-sans px-8 rounded-xl h-11 shadow-lg shadow-accent/20 transition-all">
                      Update Dispatch
                    </Button>
                  </div>
                </div>
              )}

              {/* Intelligence Audit Trail (Timeline) */}
              {auditLogs.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <Label className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Audit Timeline</Label>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                    {auditLogs.map((log, idx) => (idx === auditLogs.length - 1 || log.previous_status !== auditLogs[idx+1]?.new_status) && (
                      <div key={log.id} className="relative">
                        <div className="absolute -left-[19px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-background" />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-primary">
                              {log.new_status.replace("_", " ")}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-sans italic">
                            {log.previous_status ? `Transitioned from ${log.previous_status.replace("_", " ")}` : "Initial submission entry recorded."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
