import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, CheckCircle2, Clock, UserCheck, ShieldCheck, FolderClosed } from "lucide-react";

const mockTimeline = [
  { status: "Submitted", date: "2026-01-20", note: "Disclosure received and logged securely.", icon: CheckCircle2, complete: true },
  { status: "Under Review", date: "2026-01-25", note: "Preliminary assessment of disclosure in progress.", icon: Clock, complete: true },
  { status: "Assigned", date: "2026-02-01", note: "Assigned to a review officer for evaluation.", icon: UserCheck, complete: false },
  { status: "Verified", date: "", note: "Pending verification of disclosed information.", icon: ShieldCheck, complete: false },
  { status: "Closed", date: "", note: "Outcome determination pending.", icon: FolderClosed, complete: false },
];

interface TrackDisclosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrackDisclosureDialog = ({ open, onOpenChange }: TrackDisclosureDialogProps) => {
  const [refId, setRefId] = useState("");
  const [showTimeline, setShowTimeline] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (refId.trim().length >= 5) {
      setShowTimeline(true);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setRefId("");
      setShowTimeline(false);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Track Your Disclosure</DialogTitle>
          <DialogDescription>
            Enter your self-reporting reference ID to view the current status of your disclosure.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1">
            <Label htmlFor="dialog-sr-track-ref" className="sr-only">Self-Reporting Reference ID</Label>
            <Input
              id="dialog-sr-track-ref"
              placeholder="e.g. ICPC-SR-2026-XYZ789"
              value={refId}
              onChange={(e) => { setRefId(e.target.value); setShowTimeline(false); }}
              maxLength={30}
            />
          </div>
          <Button type="submit" className="font-sans gap-2">
            <Search className="h-4 w-4" />
            Track
          </Button>
        </form>

        {showTimeline && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground font-sans mb-4">
              Status for: <strong className="text-foreground">{refId}</strong>
            </p>
            <ol className="relative border-l-2 border-primary/30 ml-4 space-y-6" aria-label="Disclosure status timeline">
              {mockTimeline.map((step) => (
                <li key={step.status} className="ml-6">
                  <span
                    className={`absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-background ${
                      step.complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <step.icon className="h-3.5 w-3.5" />
                  </span>
                  <h3 className={`text-sm font-bold font-sans ${step.complete ? "text-primary" : "text-muted-foreground"}`}>
                    {step.status}
                  </h3>
                  {step.date && (
                    <time className="text-xs text-muted-foreground font-sans">{step.date}</time>
                  )}
                  <p className="text-sm text-muted-foreground font-sans mt-1">{step.note}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrackDisclosureDialog;
