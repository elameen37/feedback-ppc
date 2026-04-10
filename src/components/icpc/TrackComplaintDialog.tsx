import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, CheckCircle2, Clock, UserCheck, MessageSquare, FolderClosed, Loader2, AlertCircle, Shield, Activity, Calendar } from "lucide-react";
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

interface TrackComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrackComplaintDialog = ({ open, onOpenChange }: TrackComplaintDialogProps) => {
  const [refId, setRefId] = useState("");
  const [complaint, setComplaint] = useState<{ id: string; status: string; created_at: string; tracking_id: string; category: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refId.trim().length < 5) return;
    setLoading(true);
    setNotFound(false);
    setComplaint(null);
    setAuditLogs([]);

    const { data, error } = await supabase
      .from("complaints")
      .select("id, status, created_at, tracking_id, category")
      .eq("tracking_id", refId.trim())
      .maybeSingle();

    if (error || !data) {
      setLoading(false);
      setNotFound(true);
    } else {
      setComplaint(data);
      // Fetch activity logs
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("complaint_id", data.id)
        .order("created_at", { ascending: false });
      
      setAuditLogs(logs || []);
      setLoading(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) { setRefId(""); setComplaint(null); setAuditLogs([]); setNotFound(false); }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto glass-card border-white/10 bg-background/80 backdrop-blur-2xl transition-all duration-500">
        <DialogHeader className="mb-6 relative">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
             <Shield className="h-6 w-6 text-primary" />
             Track Complaint Intelligence
          </DialogTitle>
          <DialogDescription className="font-sans text-muted-foreground/80 mt-2">
            Enter your secure tracking reference ID to view the full investigation activity log.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-8 animate-reveal stagger-1">
          <div className="flex-1 space-y-1">
            <Label htmlFor="dialog-track-ref" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block font-sans">Secure Reference ID</Label>
            <Input
              id="dialog-track-ref"
              placeholder="e.g. ICPC-2026-ABC123"
              className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent font-mono"
              value={refId}
              onChange={(e) => { setRefId(e.target.value); setComplaint(null); setNotFound(false); }}
              maxLength={30}
            />
          </div>
          <Button type="submit" className="sm:mt-[18px] h-12 px-8 font-sans gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Scanning..." : "Sync Logs"}
          </Button>
        </form>

        {notFound && (
          <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 animate-reveal flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-bold text-destructive font-sans">Access Denied / Not Found</p>
              <p className="text-xs text-destructive/70 font-sans">No matching record found for the provided Intelligence ID.</p>
            </div>
          </div>
        )}

        {complaint && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-reveal stagger-2">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-sans">Current Status</p>
                <Badge className={`${
                   complaint.status === "closed" ? "bg-muted text-muted-foreground" : "bg-primary text-white"
                } h-6 px-3 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm`}>
                  {statusLabels[complaint.status] || complaint.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-sans">Intel Reference</p>
                <p className="text-xs font-mono font-bold text-foreground">{complaint.tracking_id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground font-sans">Investigative Activity Log</h3>
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
                        <div className={`glass-card p-4 border-white/5 transition-all duration-300 hover:border-primary/20 group ${
                          isLatest ? "bg-primary/5 border-primary/10" : "bg-white/5"
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${isLatest ? "text-primary" : "text-muted-foreground"}`} />
                              <p className={`text-xs font-bold font-sans ${isLatest ? "text-primary" : "text-foreground"}`}>
                                {statusLabels[log.new_status] || "Status Update"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground opacity-60">
                              <Calendar className="h-3 w-3" />
                              {new Date(log.created_at).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })}
                            </div>
                          </div>
                          {log.notes && (
                            <p className="text-xs text-muted-foreground/80 font-sans leading-relaxed pl-6 italic border-l border-white/5">
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
                    <div className="glass-card p-4 bg-primary/5 border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <p className="text-xs font-bold font-sans text-primary">Case Registered</p>
                      </div>
                      <p className="text-xs text-muted-foreground/80 font-sans pl-6">
                        Case successfully logged into the ICPC security framework.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrackComplaintDialog;
