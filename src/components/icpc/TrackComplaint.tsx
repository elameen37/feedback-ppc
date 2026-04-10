import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle2, Clock, UserCheck, MessageSquare, FolderClosed, Shield, Activity, Calendar, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const statusIcons: Record<string, any> = {
  submitted: CheckCircle2,
  under_review: Clock,
  assigned: UserCheck,
  responded: MessageSquare,
  closed: FolderClosed,
};

const statusLabels: Record<string, string> = {
  submitted: "Case Registered",
  under_review: "Intelligence Review",
  assigned: "Specialist Assigned",
  responded: "Formal Response",
  closed: "Case Finalized",
};

const TrackComplaint = () => {
  const [refId, setRefId] = useState("");
  const [complaint, setComplaint] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refId.trim().length < 5) return;
    
    setLoading(true);
    setNotFound(false);
    setComplaint(null);
    setAuditLogs([]);

    const { data, error } = await supabase
      .from("complaints")
      .select("id, status, created_at, tracking_id")
      .eq("tracking_id", refId.trim())
      .maybeSingle();

    if (error || !data) {
      setLoading(false);
      setNotFound(true);
    } else {
      setComplaint(data);
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("complaint_id", data.id)
        .order("created_at", { ascending: false });
      
      setAuditLogs(logs || []);
      setLoading(false);
    }
  };

  return (
    <section id="track" className="py-20 sm:py-24 bg-mesh relative overflow-hidden" aria-labelledby="track-title">
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-background to-transparent z-10" />
      <div className="container px-4 sm:px-6 max-w-4xl relative z-20">
        <div className="text-center mb-16 animate-reveal">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary tracking-widest uppercase text-[10px] py-1 px-4">Tracker Intelligence</Badge>
          <h2 id="track-title" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Verify Submission Status
          </h2>
          <p className="text-muted-foreground font-sans max-w-xl mx-auto">
            Utilize your unique digital tracking reference to synchronize with our secure investigative activity logs.
          </p>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl mb-12 shadow-2xl animate-reveal stagger-1">
          <CardContent className="p-8">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="track-ref" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Reference Intel ID</Label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="track-ref"
                    placeholder="e.g. ICPC-2026-ABC123"
                    className="glass-card bg-background/40 h-14 pl-12 border-white/5 focus-visible:ring-primary font-mono text-lg"
                    value={refId}
                    onChange={(e) => { setRefId(e.target.value); setNotFound(false); }}
                    maxLength={30}
                  />
                </div>
              </div>
              <Button type="submit" className="md:mt-7 h-14 px-10 font-sans gap-2 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 text-md font-bold" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                {loading ? "Authenticating..." : "Fetch Activity Log"}
              </Button>
            </form>

            {notFound && (
              <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-reveal">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm font-bold text-destructive font-sans">Verification Failed: Intelligence ID not found in secure registry.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {complaint && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
               <Card className="glass-card border-white/5 bg-primary/5 animate-reveal stagger-2">
                 <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 font-sans">Case Identification</p>
                    <div className="space-y-4">
                       <div>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-sans">Intel Reference</p>
                          <p className="text-lg font-mono font-bold text-foreground">{complaint.tracking_id}</p>
                       </div>
                       <div>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-sans">Current Stage</p>
                          <Badge className="bg-primary text-white mt-1 uppercase text-[10px] font-bold tracking-widest px-3">
                             {statusLabels[complaint.status] || complaint.status}
                          </Badge>
                       </div>
                    </div>
                 </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-2 px-1 animate-reveal stagger-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground font-sans">Activity Timeline</h3>
              </div>
              
              <div className="relative space-y-4 pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-primary/10 before:to-transparent">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log, i) => {
                    const Icon = statusIcons[log.new_status] || Activity;
                    const isLatest = i === 0;
                    return (
                      <div key={log.id} className={`relative animate-reveal stagger-${Math.min(i + 3, 6)}`}>
                        <div className={`absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-background shadow-sm ${
                          isLatest ? "bg-primary animate-pulse" : "bg-muted"
                        }`} />
                        <div className={`glass-card p-6 border-white/5 transition-all duration-300 hover:border-primary/20 group ${
                          isLatest ? "bg-primary/5 border-primary/10 scale-[1.02]" : "bg-white/5"
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isLatest ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <p className={`text-sm font-bold font-sans ${isLatest ? "text-primary text-lg" : "text-foreground"}`}>
                                {statusLabels[log.new_status] || "Status Update"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground opacity-60 font-sans tracking-wide">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(log.created_at).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })}
                            </div>
                          </div>
                          {log.notes && (
                            <p className="text-sm text-muted-foreground/80 font-sans leading-relaxed pl-10 italic border-l border-white/5">
                              "{log.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="relative animate-reveal stagger-3">
                    <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-background bg-primary" />
                    <div className="glass-card p-6 bg-primary/5 border-primary/10">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <p className="text-md font-bold font-sans text-primary">Case Registered</p>
                      </div>
                      <p className="text-sm text-muted-foreground/80 font-sans pl-8">
                        The submission has been received and securely registered within our portal's investigative framework.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrackComplaint;
