import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, CheckCircle2, Clock, UserCheck, MessageSquare, FolderClosed, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusSteps = [
  { key: "submitted", label: "Submitted", note: "Complaint received and logged.", icon: CheckCircle2 },
  { key: "under_review", label: "Under Review", note: "Preliminary assessment in progress.", icon: Clock },
  { key: "assigned", label: "Assigned", note: "Assigned to investigating officer.", icon: UserCheck },
  { key: "responded", label: "Responded", note: "Response received from relevant parties.", icon: MessageSquare },
  { key: "closed", label: "Closed", note: "Case resolution complete.", icon: FolderClosed },
];

const statusOrder = statusSteps.map(s => s.key);

interface TrackComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrackComplaintDialog = ({ open, onOpenChange }: TrackComplaintDialogProps) => {
  const [refId, setRefId] = useState("");
  const [complaint, setComplaint] = useState<{ status: string; created_at: string; tracking_id: string } | null>(null);
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
      .select("status, created_at, tracking_id")
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
      <DialogContent className="max-w-lg glass-panel border-white/10 text-white max-h-[85vh] overflow-y-auto shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold uppercase tracking-widest text-primary animate-neon-glow">
            Track Case Status
          </DialogTitle>
          <DialogDescription className="font-sans text-muted-foreground/80">
            Enter your secure tracking reference ID to view the current status of your submission in our registry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="dialog-track-ref" className="sr-only">Tracking Reference ID</Label>
            <Input
              id="dialog-track-ref"
              placeholder="e.g. ICPC-2026-ABC123"
              className="bg-white/5 border-white/10 focus:border-primary/50 transition-all font-sans h-12"
              value={refId}
              onChange={(e) => { setRefId(e.target.value); setComplaint(null); setNotFound(false); }}
              maxLength={30}
            />
          </div>
          <Button type="submit" className="font-bold font-sans gap-2 h-12 px-6 rounded-xl group transition-all" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />}
            Track
          </Button>
        </form>

        {notFound && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans animate-in fade-in zoom-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>No submission record found with that tracking ID. Please verify your reference and try again.</p>
          </div>
        )}

        {complaint && (
          <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Tracking ID</p>
              <p className="text-lg font-mono font-bold text-primary tracking-widest uppercase">{complaint.tracking_id}</p>
            </div>
            
            <div className="relative pl-6 space-y-8 before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10" aria-label="Complaint status timeline">
              {statusSteps.map((step, i) => {
                const complete = i <= currentIndex;
                const active = i === currentIndex;
                return (
                  <div key={step.key} className="relative">
                    <span className={`absolute -left-[27px] top-0 flex items-center justify-center w-6 h-6 rounded-full border shadow-2xl transition-all duration-500 ${
                      active ? "bg-primary text-primary-foreground border-primary scale-125 neon-glow" : 
                      complete ? "bg-primary/20 text-primary border-primary/30" : 
                      "bg-black text-muted-foreground border-white/10"
                    }`}>
                      <step.icon className={`h-3.5 w-3.5 ${active ? "animate-pulse" : ""}`} />
                    </span>
                    <div className="space-y-1">
                      <h3 className={`text-sm font-bold uppercase tracking-widest font-sans transition-colors duration-500 ${complete ? "text-primary" : "text-muted-foreground"}`}>
                        {step.label}
                      </h3>
                      {i === 0 && complaint.created_at && (
                        <p className="text-[10px] font-mono opacity-40 uppercase tracking-tighter">
                          Authenticated: {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground/70 font-sans leading-relaxed">{step.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrackComplaintDialog;
