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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { LogOut, Search, FileDown, Filter, Clock, Eye, Activity, CheckCircle2, AlertCircle, Inbox, TrendingUp, Shield, ChevronLeft, ChevronRight, Bell, Users, ShieldCheck, UserPlus, Settings2, Loader2, Check } from "lucide-react";
import type { Tables, Database } from "@/integrations/supabase/types";
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Management State
  const [activeTab, setActiveTab] = useState<"reports" | "personnel">("reports");
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [personnelLoading, setPersonnelLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [newOfficerData, setNewOfficerData] = useState({ full_name: "", email: "", password: "" });
  const [isRegistering, setIsRegistering] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user, currentPage, filterStatus, filterCategory, searchQuery]);

  useEffect(() => {
    if (user) {
      const channel = subscribeToNewComplaints();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const playNotificationSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play blocked by browser:", e));
  };

  const subscribeToNewComplaints = () => {
    const channel = supabase
      .channel(`reports-sync-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'complaints' },
        (payload) => {
          const newNotify = {
            id: payload.new.id,
            title: "New Intelligence Received!",
            description: `Ref ID: ${payload.new.tracking_id} - ${payload.new.category.replace(/_/g, ' ')}`,
            time: new Date().toLocaleTimeString(),
            unread: true
          };
          setNotifications(prev => [newNotify, ...prev]);
          playNotificationSound();
          toast({
            title: "New Intelligence Received!",
            description: `A new report has been filed securely. Reference ID: ${payload.new.tracking_id}`,
            className: "glass-card border-accent bg-accent/10 border-2",
          });
          fetchComplaints(); // Refresh to update count and list
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus("connected");
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus("disconnected");
        }
      });
    
    return channel;
  };

  const fetchComplaints = async () => {
    setLoading(true);
    
    let query = supabase
      .from("complaints")
      .select("*", { count: 'exact' });

    // Apply Filters Server-side if possible, or client-side if complex
    // For now, let's do server-side status/category filters
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    if (filterCategory !== "all") query = query.eq("category", filterCategory);
    if (searchQuery) query = query.ilike("tracking_id", `%${searchQuery}%`);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setComplaints(data);
      setTotalCount(count || 0);
    }
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

  const fetchPersonnel = async () => {
    if (role !== "admin") return;
    setPersonnelLoading(true);
    
    try {
      // Fetch profiles
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*");

      if (pError) throw pError;

      // Fetch all roles to map them
      const { data: roles, error: rError } = await supabase
        .from("user_roles")
        .select("*");

      if (rError) throw rError;

      const formatted = profiles.map((p: any) => {
        const userRole = roles.find(r => r.user_id === p.user_id);
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          user_id: p.user_id,
          role: userRole?.role || "pending"
        };
      });
      
      setPersonnel(formatted);
    } catch (err: any) {
      console.error("Error fetching personnel:", err);
      toast({ 
        title: "Scanning Error", 
        description: "Unable to retrieve personnel directory. Check security clearance.", 
        variant: "destructive" 
      });
    } finally {
      setPersonnelLoading(false);
    }
  };

  const handleRegisterOfficer = async () => {
    if (!newOfficerData.email || !newOfficerData.password) {
      toast({ title: "Clearance Denied", description: "Email and Password are required fields.", variant: "destructive" });
      return;
    }

    setIsRegistering(true);
    try {
      // In a real app, we'd use a service role or a specific function to create users.
      // For this ICPC prototype, we simulate successful registration.
      const { data, error } = await supabase.auth.signUp({
        email: newOfficerData.email,
        password: newOfficerData.password,
        options: {
          data: {
            full_name: newOfficerData.full_name,
          }
        }
      });

      if (error) throw error;

      toast({ 
        title: "Officer Recruited", 
        description: `${newOfficerData.full_name} has been added to the intelligence network.`,
        className: "glass-card border-green-500/50 bg-green-500/10"
      });
      
      setRegisterDialogOpen(false);
      setNewOfficerData({ full_name: "", email: "", password: "" });
      fetchPersonnel();
    } catch (err: any) {
      console.error("Registration error:", err);
      toast({ title: "Recruitment Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleApprovePersonnel = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "officer" });

    if (error) {
      toast({ title: "Approval Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Personnel Approved", description: "Clearance upgraded to Officer level." });
      fetchPersonnel();
    }
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "officer" : "admin";
    
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole as "admin" | "officer" })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role Updated", description: `Access elevated to ${newRole.toUpperCase()}.` });
      fetchPersonnel();
    }
  };

  const handleReconnect = () => {
    setRealtimeStatus("connecting");
    supabase.removeAllChannels().then(() => {
      subscribeToNewComplaints();
      toast({ title: "Intelligence Link Reset", description: "Signal re-established with central repository." });
    });
  };

  useEffect(() => {
    if (activeTab === "personnel") {
      fetchPersonnel();
    }
  }, [activeTab]);

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

  // Remove client-side filtered logic as it's now handled by the server

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

  if (user && role === null) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center relative py-12 px-4">
          <div className="absolute inset-0 bg-grid-white/[0.02] -z-10 pointer-events-none" />
          <Card className="glass-card max-w-lg w-full border-white/10 shadow-2xl animate-reveal">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Pending Clearance</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground font-sans">
                Your registration has been securely logged. Access to the intelligence dashboard requires 
                administrative approval. Please wait for an administrator to authorize your clearance.
              </p>
              <div className="p-4 rounded-xl bg-black/5 border border-white/5 flex items-center justify-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status: Awaiting Verification</span>
              </div>
              <Button onClick={() => signOut()} variant="outline" className="w-full font-sans border-white/10">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </CardContent>
          </Card>
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
                Managing <span className="text-primary font-bold">{totalCount}</span> security reports. 
                SLA compliance is currently at <span className="text-accent font-bold">94%</span>.
              </p>
            </div>
            
              <div className="flex items-center gap-3 p-1 glass-card border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 px-3 py-1 mr-2 rounded-full bg-black/20 border border-white/5 group/link">
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    realtimeStatus === "connected" ? "bg-green-500 animate-pulse" : 
                    realtimeStatus === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                  }`} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mr-1">
                    Link: {realtimeStatus}
                  </span>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-transparent" onClick={handleReconnect} title="Re-sync Signal">
                    <TrendingUp className={`h-3 w-3 ${realtimeStatus === "connected" ? "text-green-500" : "text-muted-foreground animate-spin"}`} />
                  </Button>
                </div>
                <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0 hover:bg-accent/10 hover:text-accent transition-colors">
                      <Bell className={`h-4 w-4 ${notifications.some(n => n.unread) ? "text-accent animate-[bounce_2s_infinite]" : ""}`} />
                      {notifications.some(n => n.unread) && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-accent rounded-full border-2 border-[#0D1117]" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="glass-card border-white/10 w-[400px] sm:w-[540px]">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="text-xl font-bold flex items-center gap-2">
                        <Bell className="h-5 w-5 text-accent" /> Intelligence Activity
                      </SheetTitle>
                      <SheetDescription className="text-muted-foreground font-sans">
                        Real-time log of security events and system alerts.
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar pr-2">
                      {notifications.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-3 opacity-40">
                          <Inbox className="h-10 w-10" />
                          <p className="text-xs font-bold uppercase tracking-widest">No Recent Intel</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} 
                               className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                                 n.unread ? "bg-accent/5 border-accent/20" : "bg-white/5 border-white/5 opacity-70"
                               }`}
                               onClick={() => {
                                 setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, unread: false } : notif));
                               }}>
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <h4 className="text-sm font-bold text-primary group-hover:text-accent transition-colors">{n.title}</h4>
                              <span className="text-[10px] text-muted-foreground font-mono mt-0.5 whitespace-nowrap">{n.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-sans line-clamp-2 mb-2">{n.description}</p>
                            {n.unread && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase tracking-tighter">
                                <div className="h-1 w-1 bg-accent rounded-full" /> New Awareness
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex flex-col gap-2 mt-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full glass-card border-white/10 font-sans text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary h-10"
                          onClick={() => {
                            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                            toast({ title: "Intelligence Acknowledged", description: "All reports marked as read." });
                          }}
                        >
                          Mark All as Read
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full font-sans text-[10px] uppercase font-bold tracking-widest text-destructive hover:bg-destructive/10 h-10"
                          onClick={() => setNotifications([])}
                        >
                          Clear All Logs
                        </Button>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
                <div className="h-4 w-px bg-white/10" />
                <Button variant="ghost" size="sm" className="font-sans gap-2 hover:bg-accent/10 hover:text-accent transition-colors" onClick={exportCSV}>
                  <FileDown className="h-4 w-4" /> Export
                </Button>
                <div className="h-4 w-px bg-white/10" />
                <Button variant="ghost" size="sm" className="font-sans gap-2 text-destructive hover:bg-accent/10 hover:text-accent transition-colors" onClick={signOut}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
          </div>

          {/* Navigation Tabs (Admin Only) */}
          {role === "admin" && (
            <div className="flex items-center gap-1 p-1 bg-black/20 backdrop-blur-md rounded-2xl w-fit mb-8 animate-reveal">
              <Button 
                variant={activeTab === "reports" ? "default" : "ghost"}
                onClick={() => setActiveTab("reports")}
                className={`flex items-center gap-2 rounded-xl transition-all font-sans font-bold h-10 ${
                  activeTab === "reports" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Activity className="h-4 w-4" /> Intelligence Reports
              </Button>
              <Button 
                variant={activeTab === "personnel" ? "default" : "ghost"}
                onClick={() => setActiveTab("personnel")}
                className={`flex items-center gap-2 rounded-xl transition-all font-sans font-bold h-10 ${
                  activeTab === "personnel" ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="h-4 w-4" /> Personnel Management
              </Button>
            </div>
          )}

          {activeTab === "reports" ? (
            <>
              {/* Stats Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
                {/* Total Reports - Large Feature Card */}
                <Card className="md:col-span-2 lg:col-span-2 glass-card border-white/10 overflow-hidden relative group animate-reveal stagger-1">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-24 w-24 text-accent" />
                  </div>
                  <CardContent className="pt-8 pb-6 bg-gradient-to-br from-primary/5 to-accent/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Traffic</p>
                    <p className="text-5xl font-black text-primary mb-2 tracking-tighter">{totalCount}</p>
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
                    <Input placeholder="Filter by Intel ID (e.g. ICPC-2026)..." 
                           className="pl-11 h-12 bg-black/10 border-white/5 rounded-xl font-sans text-sm focus-visible:ring-accent"
                           value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                  </div>
                  <div className="flex gap-3">
                    <Select value={filterCategory} onValueChange={val => { setFilterCategory(val); setCurrentPage(1); }}>
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
                      {complaints.length === 0 ? (
                        <TableRow className="border-white/5">
                          <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-sans">
                            <div className="flex flex-col items-center gap-2 opacity-50">
                              <Inbox className="h-12 w-12" />
                              <p className="font-medium">No archived records match your current filters.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : complaints.map(c => {
                        const sla = getSLAWarning(c);
                        return (
                          <TableRow key={c.id} className="border-white/5 hover:bg-white/5 transition-colors group animate-reveal">
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

                {/* Pagination Controls */}
                <div className="p-6 border-t border-white/5 bg-black/10 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-sans">
                    Showing <span className="text-foreground">{Math.min(complaints.length, pageSize)}</span> of <span className="text-foreground">{totalCount}</span> Intelligence Reports
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="glass-card border-white/10 h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(totalCount / pageSize) }).map((_, i) => (
                        <Button 
                          key={i}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(i + 1)}
                          className={`h-8 w-8 p-0 text-[10px] font-bold font-sans ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg' : 'glass-card border-white/10'}`}
                        >
                          {i + 1}
                        </Button>
                      )).slice(Math.max(0, currentPage - 3), Math.min(Math.ceil(totalCount / pageSize), currentPage + 2))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="glass-card border-white/10 h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="animate-reveal">
              {/* Personnel Management Section */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Intelligence Personnel</h2>
                  <p className="text-sm text-muted-foreground">Managing security clearance and access levels for all portal officers.</p>
                </div>
                <Button className="font-sans gap-2 h-10 px-6 rounded-xl bg-accent text-white shadow-lg shadow-accent/20"
                        onClick={() => setRegisterDialogOpen(true)}>
                  <UserPlus className="h-4 w-4" /> Register Officer
                </Button>
              </div>

              <Card className="glass-card border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-black/20 backdrop-blur-md">
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="font-sans uppercase text-[10px] font-bold tracking-widest py-5">Officer Identity</TableHead>
                        <TableHead className="font-sans uppercase text-[10px] font-bold tracking-widest py-5">Email Archive</TableHead>
                        <TableHead className="font-sans uppercase text-[10px] font-bold tracking-widest py-5 text-center">Security Clearance</TableHead>
                        <TableHead className="font-sans uppercase text-[10px] font-bold tracking-widest py-5 text-right px-6">Access Protocol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {personnelLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-20 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-50">
                              <Loader2 className="h-10 w-10 animate-spin" />
                              <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Personnel DB...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : personnel.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-20 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-30">
                              <Inbox className="h-10 w-10" />
                              <p className="text-[10px] font-bold uppercase tracking-widest">Personnel Database is Empty</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : personnel.map(p => (
                        <TableRow key={p.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                          <TableCell className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-xs font-bold text-primary">{p.full_name?.charAt(0) || "U"}</span>
                              </div>
                              <span className="font-sans font-medium text-foreground">{p.full_name || "Unknown Identity"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs opacity-70">{p.email || "N/A"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-[0.2em] py-1 px-4 border-white/10 ${
                              p.role === "admin" 
                                ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                : p.role === "pending"
                                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  : "bg-primary/10 text-primary border-primary/20"
                            }`}>
                              {p.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-6">
                            {p.role === "pending" ? (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleApprovePersonnel(p.user_id)}
                                className="font-sans text-[10px] font-bold gap-2 px-4 rounded-full transition-all bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Approve Access
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                disabled={p.user_id === user?.id}
                                onClick={() => handleUpdateRole(p.user_id, p.role)}
                                className={`font-sans text-[10px] font-bold gap-2 px-4 rounded-full transition-all ${
                                  p.role === "admin" ? "hover:bg-primary/10 text-primary" : "hover:bg-accent/10 text-accent"
                                }`}
                              >
                                <Settings2 className="h-3.5 w-3.5" />
                                {p.role === "admin" ? "Downgrade Access" : "Elevate Access"}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}
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
      {/* Personnel Registration Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="max-w-md glass-card border-white/20 shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="h-1.5 bg-accent w-full" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-accent" /> Recategorize Personnel
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 font-sans">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Full Name / Alias</Label>
                <Input 
                  placeholder="Officer name..." 
                  className="glass-card border-white/10 bg-white/5"
                  value={newOfficerData.full_name}
                  onChange={(e) => setNewOfficerData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Secure Email</Label>
                <Input 
                  type="email" 
                  placeholder="officer@icpc.gov.ng" 
                  className="glass-card border-white/10 bg-white/5"
                  value={newOfficerData.email}
                  onChange={(e) => setNewOfficerData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Temporary Passphrase</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="glass-card border-white/10 bg-white/5"
                  value={newOfficerData.password}
                  onChange={(e) => setNewOfficerData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="ghost" onClick={() => setRegisterDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button 
                onClick={handleRegisterOfficer}
                disabled={isRegistering}
                className="bg-accent text-white rounded-xl px-8 shadow-lg shadow-accent/20"
              >
                {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Officer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
