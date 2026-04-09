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
import { LogOut, Search, FileDown, Filter, Clock, Eye } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { sendNotification } from "@/lib/notifications";

type Complaint = Tables<"complaints">;
type AuditLog = Tables<"audit_logs">;

const statusColors: Record<string, string> = {
  submitted: "bg-white/10 text-white border-white/20",
  under_review: "bg-white/5 text-white/80 border-white/10",
  assigned: "bg-primary/20 text-primary border-primary/30",
  responded: "bg-primary text-primary-foreground border-primary",
  closed: "bg-black text-muted-foreground border-white/5",
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

  const getSLAWarning = (c: Complaint) => {
    const age = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (c.status === "submitted" && age > 14) return "Overdue";
    if (c.status === "under_review" && age > 30) return "Overdue";
    return null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin neon-glow" />
            <p className="text-primary font-bold tracking-widest uppercase text-xs">Accessing Records...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] pointer-events-none" />
      
      <Header />
      <main className="flex-1 py-8 px-4 relative z-10">
        <div className="container max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight uppercase animate-neon-glow">
                {role === "admin" ? "Systems Admin" : "Officer"} Terminal
              </h1>
              <p className="text-sm text-muted-foreground font-sans mt-1">
                {complaints.length} Total Submissions <span className="mx-2 opacity-30">|</span> {filtered.length} Indexed
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="font-bold border-white/10 hover:border-primary/50 transition-all gap-2" onClick={exportCSV}>
                <FileDown className="h-4 w-4" /> Export
              </Button>
              <Button variant="secondary" size="sm" className="font-bold gap-2" onClick={signOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {["submitted", "under_review", "assigned", "responded", "closed"].map(s => (
              <Card key={s} className={`cursor-pointer transition-all duration-300 ${filterStatus === s ? 'neon-glow border-primary/50 bg-primary/5' : 'glass-panel border-white/5 bg-white/5'}`}
                    onClick={() => setFilterStatus(s === filterStatus ? "all" : s)}>
                <CardContent className="pt-5 pb-4 text-center">
                  <p className="text-3xl font-bold text-primary mb-1">
                    {complaints.filter(c => c.status === s).length}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">{s.replace("_", " ")}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input placeholder="Search records by ID or description..." className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all font-sans"
                     value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-56 h-11 bg-white/5 border-white/10 focus:border-primary/50 font-sans">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/10">
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="glass-panel border-white/5 overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5 text-primary border-b border-white/5">
                    <TableRow className="hover:bg-transparent border-b border-white/5">
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] h-12">Tracking ID</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] h-12">Category</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] h-12">Status</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] h-12">Type</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] h-12">Date</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] h-12 text-center">Alerts</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] h-12 text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-20 text-muted-foreground font-sans">
                          No records match your current identity fragments.
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(c => {
                      const sla = getSLAWarning(c);
                      return (
                        <TableRow key={c.id} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                          <TableCell className="font-mono text-xs text-primary/80 group-hover:text-primary transition-colors">{c.tracking_id}</TableCell>
                          <TableCell className="text-sm font-sans">{categoryLabels[c.category] ?? c.category}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest ${statusColors[c.status] ?? ""}`}>
                              {c.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-sans opacity-70 capitalize">{c.submission_type}</TableCell>
                          <TableCell className="text-xs font-sans opacity-70">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-center">
                            {sla && (
                              <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-widest gap-1 animate-pulse border-none">
                                <Clock className="h-3 w-3" /> {sla}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="sm" className="hover:bg-white/10 hover:text-primary transition-all font-bold font-sans text-xs gap-2" onClick={() => handleViewComplaint(c)}>
                              <Eye className="h-4 w-4" /> Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <Dialog open={!!selectedComplaint} onOpenChange={(v) => !v && setSelectedComplaint(null)}>
        <DialogContent className="max-w-3xl glass-panel border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-white/10 pb-4 mb-6">
            <DialogTitle className="text-2xl font-bold uppercase tracking-tighter text-primary flex items-center gap-3">
              <span className="p-2 rounded-lg bg-primary/10"><Shield className="h-6 w-6" /></span>
              Case File: {selectedComplaint?.tracking_id}
            </DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-sans">
                <div className="space-y-4 font-sans">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Category</span>
                    <span className="font-bold">{categoryLabels[selectedComplaint.category]}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Protocol</span>
                    <span className="font-bold opacity-80 uppercase">{selectedComplaint.submission_type}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Identity</span>
                    <span className="font-bold italic">{selectedComplaint.anonymous ? "Secure/Anonymous" : "Public/Known"}</span>
                  </div>
                </div>
                <div className="space-y-4 font-sans">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Current Status</span>
                    <Badge variant="outline" className={`font-bold uppercase tracking-widest text-[9px] ${statusColors[selectedComplaint.status]}`}>
                      {selectedComplaint.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Logged On</span>
                    <span className="font-bold opacity-80">{new Date(selectedComplaint.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!selectedComplaint.anonymous && (selectedComplaint.submitter_name || selectedComplaint.submitter_contact) && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-2">Complainant Intelligence</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1 uppercase tracking-tighter">Full Name</p>
                      <p className="font-bold">{selectedComplaint.submitter_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 uppercase tracking-tighter">Contact Secure</p>
                      <p className="font-bold">{selectedComplaint.submitter_contact || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/70 mb-3 block">Documented Narrative</Label>
                <div className="p-6 bg-black/60 border border-white/5 rounded-2xl font-sans text-sm leading-relaxed whitespace-pre-wrap shadow-inner min-h-[150px]">
                  {selectedComplaint.description}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col sm:flex-row gap-6 items-end">
                  <div className="flex-1 space-y-2 w-full">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-primary">Override Case Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="bg-black/50 border-white/10 h-11 font-sans"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-panel border-white/10">
                        {["submitted", "under_review", "assigned", "responded", "closed"].map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleUpdateStatus} disabled={newStatus === selectedComplaint.status} className="h-11 px-8 font-bold uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    Commit Update
                  </Button>
                </div>
              </div>

              {auditLogs.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">Historical Audit Trail</Label>
                  <div className="space-y-2 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                    {auditLogs.map(log => (
                      <div key={log.id} className="relative pl-6 py-2">
                        <div className="absolute left-1 top-4 w-2 h-2 rounded-full bg-primary/40 border border-primary/60" />
                        <div className="flex items-center justify-between gap-4 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all group">
                          <span className="text-[11px] font-sans">
                            Status Shifted: <span className="text-muted-foreground uppercase tracking-tighter mx-1">{log.previous_status?.replace("_", " ") ?? "Genesis"}</span> 
                            <span className="mx-2">→</span>
                            <span className="font-bold text-primary uppercase tracking-tighter">{log.new_status.replace("_", " ")}</span>
                          </span>
                          <span className="text-[10px] font-mono opacity-40 group-hover:opacity-100 transition-opacity">[{new Date(log.created_at).toLocaleString()}]</span>
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
