import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, CheckCircle2, Clock, UserCheck, MessageSquare, FolderClosed, Loader2, AlertCircle, Shield, CheckCircle, Download } from "lucide-react";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const statusSteps = [
  { key: "submitted", label: "Registered", note: "Case logged and awaiting intelligence review.", icon: CheckCircle2 },
  { key: "under_review", label: "Intelligence Review", note: "Security assessment and data analysis in progress.", icon: Clock },
  { key: "assigned", label: "Specialist Assigned", note: "Assigned to the relevant investigation department.", icon: UserCheck },
  { key: "responded", label: "Formal Response", note: "Investigation findings and response transmitted.", icon: MessageSquare },
  { key: "closed", label: "Case Finalized", note: "Official case closure and filing complete.", icon: FolderClosed },
];

const statusOrder = statusSteps.map(s => s.key);

interface TrackComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrackComplaintDialog = ({ open, onOpenChange }: TrackComplaintDialogProps) => {
  const [refId, setRefId] = useState("");
  const [complaint, setComplaint] = useState<{ id: string; status: string; created_at: string; tracking_id: string; category: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refId.trim().length < 5) return;
    setLoading(true);
    setNotFound(false);
    setComplaint(null);

    const { data, error } = await supabase
      .from("complaints")
      .select("id, status, created_at, tracking_id, category")
      .eq("tracking_id", refId.trim())
      .maybeSingle();

    setLoading(false);
    if (error || !data) {
      setNotFound(true);
    } else {
      setComplaint(data);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) { setRefId(""); setComplaint(null); setNotFound(false); }
    onOpenChange(val);
  };

  const currentIndex = complaint ? statusOrder.indexOf(complaint.status) : -1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto glass-card border-white/10 bg-background/80 backdrop-blur-2xl transition-all duration-500">
        <DialogHeader className="mb-6 relative">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
             <Shield className="h-6 w-6 text-primary" />
             Track Complaint Progress
          </DialogTitle>
          <DialogDescription className="font-sans text-muted-foreground/80 mt-2">
            Enter your secure tracking reference ID to view the current stage of investigation.
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
          <Button type="submit" className="sm:mt-[18px] h-12 px-8 font-sans gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Verifying..." : "Track Progress"}
          </Button>
        </form>

        {notFound && (
          <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 animate-reveal flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-bold text-destructive font-sans">Verification Failed</p>
              <p className="text-xs text-destructive/70 font-sans">No matching security record found for the provided Intelligence ID.</p>
            </div>
          </div>
        )}

        {complaint && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-reveal stagger-2">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-sans">Current Stage</p>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                   <Badge className="bg-primary text-white h-6 px-3 rounded-full text-[10px] font-bold tracking-wider uppercase">
                      {statusSteps[currentIndex]?.label || complaint.status.replace("_", " ")}
                   </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-sans">Intel Reference</p>
                <p className="text-xs font-mono font-bold text-foreground">{complaint.tracking_id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground font-sans">Investigative Milestone Path</h3>
              </div>
              
              <div className="relative space-y-2 pl-4 before:absolute before:left-0 before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-primary/10 before:to-transparent">
                {statusSteps.map((step, i) => {
                  const isCompleted = i < currentIndex;
                  const isCurrent = i === currentIndex;
                  const isPending = i > currentIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className={`relative animate-reveal stagger-${i + 3}`}>
                      <div className={`absolute -left-[20px] top-4 w-2.5 h-2.5 rounded-full ring-4 ring-background shadow-sm transition-all duration-500 ${
                        isCompleted ? "bg-primary" : 
                        isCurrent ? "bg-primary animate-pulse h-3 w-3 -left-[21px]" : 
                        "bg-muted"
                      }`} />
                      
                      <div className={`glass-card p-4 border-white/5 transition-all duration-300 ${
                        isCurrent ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5" : 
                        isCompleted ? "bg-white/5 opacity-80" : 
                        "bg-transparent opacity-40 grayscale"
                      }`}>
                        <div className="flex items-center gap-3 mb-1">
                          <Icon className={`h-4 w-4 ${isCurrent ? "text-primary" : isCompleted ? "text-primary/70" : "text-muted-foreground"}`} />
                          <p className={`text-xs font-bold font-sans ${isCurrent ? "text-primary" : "text-foreground"}`}>
                            {step.label}
                          </p>
                          {isCompleted && <CheckCircle2 className="h-3 w-3 text-primary ml-auto" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 font-sans leading-relaxed pl-7">
                          {step.note}
                        </p>
                        {i === 0 && complaint.created_at && (
                          <p className="text-[9px] text-muted-foreground/40 font-sans mt-2 pl-7">
                            Logged on: {new Date(complaint.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrackComplaintDialog;
