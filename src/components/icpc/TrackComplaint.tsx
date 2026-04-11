import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle2, Clock, UserCheck, MessageSquare, FolderClosed, Shield, Loader2, AlertCircle, CheckCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import { generateQRDataURL } from "@/lib/qrcode";

const statusSteps = [
  { key: "submitted", label: "Registered", note: "The submission has been received and securely registered within our portal.", icon: CheckCircle2 },
  { key: "under_review", label: "Intelligence Review", note: "Security assessment and data analysis of the report in progress.", icon: Clock },
  { key: "assigned", label: "Specialist Assigned", note: "Assigned to the relevant investigation department for field evaluation.", icon: UserCheck },
  { key: "responded", label: "Formal Response", note: "Formal communication regarding investigation findings has been transmitted.", icon: MessageSquare },
  { key: "closed", label: "Case Finalized", note: "Official case closure and archival within the commission's framework.", icon: FolderClosed },
];

const statusOrder = statusSteps.map(s => s.key);

const TrackComplaint = () => {
  const [refId, setRefId] = useState("");
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

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
      .maybeSingle();

    setLoading(false);
    if (error || !data) {
      setNotFound(true);
    } else {
      setComplaint(data);
    }
  };

  const currentIndex = complaint ? statusOrder.indexOf(complaint.status) : -1;

  const downloadPDF = async () => {
    if (!complaint) return;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(0, 100, 0);
    doc.rect(0, 0, w, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ICPC Nigeria", 14, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Independent Corrupt Practices and Other Related Offences Commission", 14, 26);
    doc.text("Complaint Progress Report", 14, 34);

    y = 52;
    doc.setTextColor(0, 0, 0);

    // Reference info
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Tracking Reference:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(complaint.tracking_id, 65, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Current Status:", 14, y);
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

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, w - 14, y);
    y += 10;

    // Progress milestones
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Milestone Progress Path", 14, y);
    y += 10;

    statusSteps.forEach((step, i) => {
      const isCompleted = i < currentIndex;
      const isCurrent = i === currentIndex;

      // Status indicator
      if (isCompleted) {
        doc.setFillColor(0, 100, 0);
      } else if (isCurrent) {
        doc.setFillColor(0, 150, 50);
      } else {
        doc.setFillColor(180, 180, 180);
      }
      doc.circle(20, y + 2, 3, "F");

      // Label
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const statusTag = isCompleted ? " ✓" : isCurrent ? " ●" : "";
      doc.text(`${step.label}${statusTag}`, 28, y + 4);

      // Note
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const noteLines = doc.splitTextToSize(step.note, w - 46);
      doc.text(noteLines, 28, y + 10);
      y += 10 + noteLines.length * 5 + 6;
    });

    // Footer
    y += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, w - 14, y);
    y += 8;

    // QR Code
    const trackUrl = `https://feedback-ppc.lovable.app/track-complaint`;
    try {
      const qrDataUrl = await generateQRDataURL(trackUrl);
      doc.addImage(qrDataUrl, "PNG", w - 54, y, 40, 40);
    } catch {}

    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("This document is auto-generated from the ICPC Nigeria Complaint Tracking System.", 14, y);
    doc.text("For inquiries, visit: https://feedback-ppc.lovable.app", 14, y + 5);
    doc.text("Scan the QR code to track your complaint online.", 14, y + 10);

    doc.save(`ICPC-Progress-${complaint.tracking_id}.pdf`);
  };

  return (
    <section id="track" className="py-20 sm:py-24 bg-mesh relative overflow-hidden" aria-labelledby="track-title">
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-background to-transparent z-10" />
      <div className="container px-4 sm:px-6 max-w-4xl relative z-20">
        <div className="text-center mb-16 animate-reveal">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary tracking-widest uppercase text-[10px] py-1 px-4">Tracker Intelligence</Badge>
          <h2 id="track-title" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Verify Submission Progress
          </h2>
          <p className="text-muted-foreground font-sans max-w-xl mx-auto">
            Utilize your unique digital tracking reference to synchronize with the official investigative milestone path.
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
              <Button type="submit" className="md:mt-7 h-14 px-10 font-sans gap-2 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 text-md font-bold transition-all active:scale-95" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                {loading ? "Authenticating..." : "Fetch Progress Path"}
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
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-sans">Current Phase</p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                             <Badge className="bg-primary text-white uppercase text-[10px] font-bold tracking-widest px-3">
                                {statusSteps[currentIndex]?.label || complaint.status}
                             </Badge>
                          </div>
                       </div>
                    </div>
                 </CardContent>
               </Card>
               <Button onClick={downloadPDF} variant="outline" className="w-full gap-2 h-12 border-primary/20 text-primary hover:bg-primary/10 font-sans font-bold animate-reveal stagger-3">
                 <Download className="h-4 w-4" />
                 Download Progress Report
               </Button>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-2 px-1 animate-reveal stagger-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground font-sans">Milestone Progress Path</h3>
              </div>
              
              <div className="relative space-y-3 pl-4 before:absolute before:left-0 before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-primary/10 before:to-transparent">
                {statusSteps.map((step, i) => {
                  const isCompleted = i < currentIndex;
                  const isCurrent = i === currentIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className={`relative animate-reveal stagger-${i + 3}`}>
                      <div className={`absolute -left-[20px] top-4 w-2.5 h-2.5 rounded-full ring-4 ring-background shadow-sm transition-all duration-500 ${
                        isCompleted ? "bg-primary" : 
                        isCurrent ? "bg-primary animate-pulse h-3 w-3 -left-[21px]" : 
                        "bg-muted"
                      }`} />
                      
                      <div className={`glass-card p-6 border-white/5 transition-all duration-300 ${
                        isCurrent ? "bg-primary/5 border-primary/20 scale-[1.02] shadow-xl shadow-primary/5" : 
                        isCompleted ? "bg-white/5 opacity-80" : 
                        "bg-transparent opacity-40 grayscale"
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isCurrent ? 'bg-primary/20 text-primary' : isCompleted ? 'bg-primary/10 text-primary/70' : 'bg-white/5 text-muted-foreground'}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <p className={`text-sm font-bold font-sans ${isCurrent ? "text-primary text-lg" : "text-foreground"}`}>
                              {step.label}
                            </p>
                          </div>
                          {isCompleted && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary opacity-60 font-sans bg-primary/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              COMPLETE
                            </div>
                          )}
                        </div>
                        <p className={`text-sm font-sans leading-relaxed pl-10 ${isCurrent ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                          {step.note}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrackComplaint;
