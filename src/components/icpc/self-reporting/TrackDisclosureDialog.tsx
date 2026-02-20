import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, CheckCircle2, Clock, UserCheck, MessageSquare, FolderClosed, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusSteps = [
  { key: "submitted", label: "Submitted", note: "Disclosure received and logged securely.", icon: CheckCircle2 },
  { key: "under_review", label: "Under Review", note: "Preliminary assessment of disclosure in progress.", icon: Clock },
  { key: "assigned", label: "Assigned", note: "Assigned to a review officer for evaluation.", icon: UserCheck },
  { key: "responded", label: "Responded", note: "Response received from relevant parties.", icon: MessageSquare },
  { key: "closed", label: "Closed", note: "Outcome determination complete.", icon: FolderClosed },
];

const statusOrder = statusSteps.map(s => s.key);

import type { Database } from "@/integrations/supabase/types";

type ComplaintCategory = Database["public"]["Enums"]["complaint_category"];

const SELF_REPORT_CATEGORIES: ComplaintCategory[] = ["self_report_officer", "self_report_individual", "self_report_organization"];

interface TrackDisclosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrackDisclosureDialog = ({ open, onOpenChange }: TrackDisclosureDialogProps) => {
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
      .in("category", SELF_REPORT_CATEGORIES)
      .maybeSingle();

    setLoading(false);
    if (error || !data) {
      setNotFound(true);
    } else {
      setComplaint(data);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setRefId("");
      setComplaint(null);
      setNotFound(false);
    }
    onOpenChange(val);
  };

  const currentIndex = complaint ? statusOrder.indexOf(complaint.status) : -1;

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
              onChange={(e) => { setRefId(e.target.value); setComplaint(null); setNotFound(false); }}
              maxLength={30}
            />
          </div>
          <Button type="submit" className="font-sans gap-2" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Track
          </Button>
        </form>

        {notFound && (
          <div className="mt-4 flex items-center gap-2 text-destructive text-sm font-sans">
            <AlertCircle className="h-4 w-4" />
            No self-reporting disclosure found with that ID. Please check and try again.
          </div>
        )}

        {complaint && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground font-sans mb-4">
              Status for: <strong className="text-foreground">{complaint.tracking_id}</strong>
            </p>
            <ol className="relative border-l-2 border-primary/30 ml-4 space-y-6" aria-label="Disclosure status timeline">
              {statusSteps.map((step, i) => {
                const complete = i <= currentIndex;
                return (
                  <li key={step.key} className="ml-6">
                    <span className={`absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-background ${
                      complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <step.icon className="h-3.5 w-3.5" />
                    </span>
                    <h3 className={`text-sm font-bold font-sans ${complete ? "text-primary" : "text-muted-foreground"}`}>
                      {step.label}
                    </h3>
                    {i === 0 && complaint.created_at && (
                      <time className="text-xs text-muted-foreground font-sans">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </time>
                    )}
                    <p className="text-sm text-muted-foreground font-sans mt-1">{step.note}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrackDisclosureDialog;
