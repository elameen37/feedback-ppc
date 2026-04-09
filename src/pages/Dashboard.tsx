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
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  assigned: "bg-purple-100 text-purple-800",
  responded: "bg-green-100 text-green-800",
  closed: "bg-muted text-muted-foreground",
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-sans">Loading dashboard...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 px-4">
        <div className="container max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">
                {role === "admin" ? "Admin" : "Officer"} Dashboard
              </h1>
              <p className="text-sm text-muted-foreground font-sans">
                {complaints.length} total complaints • {filtered.length} showing
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="font-sans gap-2" onClick={exportCSV}>
                <FileDown className="h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" className="font-sans gap-2" onClick={signOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {["submitted", "under_review", "assigned", "responded", "closed"].map(s => (
              <Card key={s} className="cursor-pointer hover:ring-2 ring-primary/20 transition-all"
                    onClick={() => setFilterStatus(s === filterStatus ? "all" : s)}>
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {complaints.filter(c => c.status === s).length}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans capitalize">{s.replace("_", " ")}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by tracking ID or description..." className="pl-9 font-sans"
                     value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48 font-sans">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sans">Tracking ID</TableHead>
                      <TableHead className="font-sans">Category</TableHead>
                      <TableHead className="font-sans">Status</TableHead>
                      <TableHead className="font-sans">Type</TableHead>
                      <TableHead className="font-sans">Date</TableHead>
                      <TableHead className="font-sans">SLA</TableHead>
                      <TableHead className="font-sans">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground font-sans">
                          No complaints found.
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(c => {
                      const sla = getSLAWarning(c);
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-xs">{c.tracking_id}</TableCell>
                          <TableCell className="text-sm font-sans">{categoryLabels[c.category] ?? c.category}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-xs font-sans ${statusColors[c.status] ?? ""}`}>
                              {c.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-sans capitalize">{c.submission_type}</TableCell>
                          <TableCell className="text-sm font-sans">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {sla && (
                              <Badge variant="destructive" className="text-xs font-sans gap-1">
                                <Clock className="h-3 w-3" /> {sla}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="font-sans gap-1" onClick={() => handleViewComplaint(c)}>
                              <Eye className="h-3.5 w-3.5" /> View
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(v) => !v && setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">
              Complaint: {selectedComplaint?.tracking_id}
            </DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm font-sans">
                <div><span className="text-muted-foreground">Category:</span> {categoryLabels[selectedComplaint.category]}</div>
                <div><span className="text-muted-foreground">Status:</span> {selectedComplaint.status.replace("_", " ")}</div>
                <div><span className="text-muted-foreground">Type:</span> {selectedComplaint.submission_type}</div>
                <div><span className="text-muted-foreground">Anonymous:</span> {selectedComplaint.anonymous ? "Yes" : "No"}</div>
                {!selectedComplaint.anonymous && selectedComplaint.submitter_name && (
                  <div><span className="text-muted-foreground">Name:</span> {selectedComplaint.submitter_name}</div>
                )}
                {!selectedComplaint.anonymous && selectedComplaint.submitter_contact && (
                  <div><span className="text-muted-foreground">Contact:</span> {selectedComplaint.submitter_contact}</div>
                )}
                <div><span className="text-muted-foreground">Date:</span> {new Date(selectedComplaint.created_at).toLocaleString()}</div>
              </div>

              <div>
                <Label className="font-sans text-muted-foreground">Description</Label>
                <p className="text-sm font-sans mt-1 p-3 bg-muted rounded">{selectedComplaint.description}</p>
              </div>

              {/* Status Update */}
              {(role === "admin" || role === "officer") && (
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="font-sans">Update Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="font-sans"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["submitted", "under_review", "assigned", "responded", "closed"].map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleUpdateStatus} disabled={newStatus === selectedComplaint.status} className="font-sans">
                    Update
                  </Button>
                </div>
              )}

              {/* Audit Log */}
              {auditLogs.length > 0 && (
                <div>
                  <Label className="font-sans text-muted-foreground">Audit Trail</Label>
                  <div className="mt-2 space-y-2">
                    {auditLogs.map(log => (
                      <div key={log.id} className="text-xs font-sans p-2 bg-muted rounded flex justify-between">
                        <span>
                          {log.previous_status?.replace("_", " ") ?? "—"} → {log.new_status.replace("_", " ")}
                        </span>
                        <span className="text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
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
