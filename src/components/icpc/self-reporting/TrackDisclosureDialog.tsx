import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, CheckCircle2, Clock, UserCheck, MessageSquare, FolderClosed, Loader2, AlertCircle, Shield, CheckCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";
import jsPDF from "jspdf";
import { generateQRDataURL } from "@/lib/qrcode";

type ComplaintCategory = Database["public"]["Enums"]["complaint_category"];
const SELF_REPORT_CATEGORIES: ComplaintCategory[] = ["self_report_officer", "self_report_individual", "self_report_organization"];

const statusSteps = [
  { key: "submitted", label: "Disclosure Logged", note: "Self-reporting disclosure has been securely transmitted and encrypted.", icon: CheckCircle2 },
  { key: "under_review", label: "Confidential Review", note: "Preliminary assessment and validation of disclosure under forensic review.", icon: Clock },
  { key: "assigned", label: "Review Officer Sync", note: "Allocated to a specialized review officer for evaluative analysis.", icon: UserCheck },
  { key: "responded", label: "Entity Response", note: "Formal communication regarding the disclosure status initiated.", icon: MessageSquare },
  { key: "closed", label: "Resolution Applied", note: "Official determination reached and investigative file archived.", icon: FolderClosed },
];

const statusOrder = statusSteps.map(s => s.key);

interface TrackDisclosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrackDisclosureDialog = ({ open, onOpenChange }: TrackDisclosureDialogProps) => {
  const [refId, setRefId] = useState("");
  const [complaint, setComplaint] = useState<{ id: string; status: string; created_at: string; tracking_id: string } | null>(null);
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
      .select("id, status, created_at, tracking_id")
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
    if (!val) { setRefId(""); setComplaint(null); setNotFound(false); }
    onOpenChange(val);
  };

  const downloadPDF = async () => {
    if (!complaint) return;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFillColor(0, 100, 0);
    doc.rect(0, 0, w, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ICPC Nigeria", 14, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Independent Corrupt Practices and Other Related Offences Commission", 14, 26);
    doc.text("Self-Reporting Disclosure Progress Report", 14, 34);

    y = 52;
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Secure Reference:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(complaint.tracking_id, 65, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Current Phase:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(statusSteps[currentIndex]?.label || complaint.status, 65, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Date Submitted:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(complaint.created_at).toLocaleDateString(), 65, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Report Generated:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleString(), 65, y);
    y += 16;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, w - 14, y);
    y += 10;

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Confidential Milestone Track", 14, y);
    y += 10;

    statusSteps.forEach((step, i) => {
      const isCompleted = i < currentIndex;
      const isCurrent = i === currentIndex;

      if (isCompleted) {
        doc.setFillColor(0, 100, 0);
      } else if (isCurrent) {
        doc.setFillColor(0, 150, 50);
      } else {
        doc.setFillColor(180, 180, 180);
      }
      doc.circle(20, y + 2, 3, "F");

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const statusTag = isCompleted ? " ✓" : isCurrent ? " ●" : "";
      doc.text(`${step.label}${statusTag}`, 28, y + 4);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const noteLines = doc.splitTextToSize(step.note, w - 46);
      doc.text(noteLines, 28, y + 10);
      y += 10 + noteLines.length * 5 + 6;
    });

    y += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, w - 14, y);
    y += 8;

    const trackUrl = `https://feedback-ppc.lovable.app/self-reporting`;
    try {
      const qrDataUrl = await generateQRDataURL(trackUrl);
      doc.addImage(qrDataUrl, "PNG", w - 54, y, 40, 40);
    } catch {}

    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("This document is auto-generated from the ICPC Nigeria Self-Reporting Disclosure System.", 14, y);
    doc.text("For inquiries, visit: https://feedback-ppc.lovable.app", 14, y + 5);
    doc.text("Scan the QR code to track your disclosure online.", 14, y + 10);

    doc.save(`ICPC-SR-Progress-${complaint.tracking_id}.pdf`);
  };

  const currentIndex = complaint ? statusOrder.indexOf(complaint.status) : -1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto glass-card border-white/10 bg-background/80 backdrop-blur-2xl transition-all duration-500">
        <DialogHeader className="mb-6 relative">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-10" />
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
             <Shield className="h-6 w-6 text-accent" />
             Track Disclosure Phase
          </DialogTitle>
          <DialogDescription className="font-sans text-muted-foreground/80 mt-2">
            Enter your secure reference ID to view the current confidentiality phase of your disclosure.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-8 animate-reveal stagger-1">
          <div className="flex-1 space-y-1">
            <Label htmlFor="dialog-sr-track-ref" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block font-sans">Confidential ID</Label>
            <Input
              id="dialog-sr-track-ref"
              placeholder="e.g. ICPC-SR-2026-XYZ789"
              className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent font-mono"
              value={refId}
              onChange={(e) => { setRefId(e.target.value); setComplaint(null); setNotFound(false); }}
              maxLength={40}
            />
          </div>
          <Button type="submit" className="sm:mt-[18px] h-12 px-8 font-sans gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Decrypting..." : "Sync Disclosure"}
          </Button>
        </form>

        {notFound && (
          <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 animate-reveal flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-bold text-destructive font-sans">Identity Unrecognized</p>
              <p className="text-xs text-destructive/70 font-sans">No secure disclosure found for the provided ID within the encryption vault.</p>
            </div>
          </div>
        )}

        {complaint && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/5 border border-accent/10 animate-reveal stagger-2">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-sans">Current Phase</p>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                   <Badge className="bg-accent text-white h-6 px-3 rounded-full text-[10px] font-bold tracking-wider uppercase">
                      {statusSteps[currentIndex]?.label || complaint.status.replace("_", " ")}
                   </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-sans">Secure Reference</p>
                <p className="text-xs font-mono font-bold text-foreground">{complaint.tracking_id}</p>
              </div>
            </div>

            <Button onClick={downloadPDF} variant="outline" className="w-full gap-2 h-10 border-accent/20 text-accent hover:bg-accent/10 font-sans font-bold text-xs">
              <Download className="h-4 w-4" />
              Download Disclosure Report
            </Button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <CheckCircle className="h-4 w-4 text-accent" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground font-sans">Confidential Milestone Track</h3>
              </div>
              
              <div className="relative space-y-2 pl-4 before:absolute before:left-0 before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-accent/40 before:via-accent/10 before:to-transparent">
                {statusSteps.map((step, i) => {
                  const isCompleted = i < currentIndex;
                  const isCurrent = i === currentIndex;
                  const isPending = i > currentIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className={`relative animate-reveal stagger-${i + 3}`}>
                      <div className={`absolute -left-[20px] top-4 w-2.5 h-2.5 rounded-full ring-4 ring-background shadow-sm transition-all duration-500 ${
                        isCompleted ? "bg-accent" : 
                        isCurrent ? "bg-accent animate-pulse h-3 w-3 -left-[21px]" : 
                        "bg-muted"
                      }`} />
                      
                      <div className={`glass-card p-4 border-white/5 transition-all duration-300 ${
                        isCurrent ? "bg-accent/5 border-accent/20 shadow-lg shadow-accent/5" : 
                        isCompleted ? "bg-white/5 opacity-80" : 
                        "bg-transparent opacity-40 grayscale"
                      }`}>
                        <div className="flex items-center gap-3 mb-1">
                          <Icon className={`h-4 w-4 ${isCurrent ? "text-accent" : isCompleted ? "text-accent/70" : "text-muted-foreground"}`} />
                          <p className={`text-xs font-bold font-sans ${isCurrent ? "text-accent" : "text-foreground"}`}>
                            {step.label}
                          </p>
                          {isCompleted && <CheckCircle2 className="h-3 w-3 text-accent ml-auto" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 font-sans leading-relaxed pl-7">
                          {step.note}
                        </p>
                        {i === 0 && complaint.created_at && (
                          <p className="text-[9px] text-muted-foreground/40 font-sans mt-2 pl-7">
                            Transmitted on: {new Date(complaint.created_at).toLocaleDateString()}
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

export default TrackDisclosureDialog;
