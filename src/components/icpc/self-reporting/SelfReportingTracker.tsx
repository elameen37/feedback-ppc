import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

const SelfReportingTracker = () => {
  const [refId, setRefId] = useState("");
  const [complaint, setComplaint] = useState<{ status: string; created_at: string; tracking_id: string; category: string } | null>(null);
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
      .select("status, created_at, tracking_id, category")
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

  const currentIndex = complaint ? statusOrder.indexOf(complaint.status) : -1;

  return (
    <section className="py-10 sm:py-24 bg-background relative overflow-hidden" aria-labelledby="sr-track-title">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="container px-4 sm:px-6 max-w-3xl relative z-10">
        <div className="text-center mb-12">
          <h2 id="sr-track-title" className="text-2xl md:text-3xl font-bold text-primary mb-3 uppercase tracking-widest animate-neon-glow">
            Track Your Disclosure
          </h2>
          <p className="text-muted-foreground font-sans max-w-xl mx-auto leading-relaxed">
            Enter your secure self-reporting reference ID to view the real-time status of your disclosure.
          </p>
        </div>

        <Card className="glass-panel border-white/10 shadow-2xl mb-12">
          <CardContent className="pt-8">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="sr-track-ref" className="sr-only">Self-Reporting Reference ID</Label>
                <Input
                  id="sr-track-ref"
                  placeholder="e.g. ICPC-SR-2026-XYZ789"
                  className="bg-white/5 border-white/10 focus:border-primary/50 transition-all font-sans h-12"
                  value={refId}
                  onChange={(e) => { setRefId(e.target.value); setComplaint(null); setNotFound(false); }}
                  maxLength={30}
                />
              </div>
              <Button type="submit" className="font-bold font-sans gap-2 h-12 px-8 rounded-xl group transition-all" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                Track Disclosure
              </Button>
            </form>

            {notFound && (
              <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans animate-in fade-in zoom-in">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>No disclosure record found with that ID. Please check and try again.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {complaint && (
          <Card className="glass-panel border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="p-1 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardContent className="pt-8 pb-10">
              <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Active Case ID</p>
                  <p className="text-xl font-mono font-bold text-primary tracking-widest uppercase">{complaint.tracking_id}</p>
                </div>
                <Badge variant="outline" className="w-fit text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary border-primary/20">
                  {complaint.category.replace(/_/g, " ")}
                </Badge>
              </div>
              
              <div className="relative pl-6 space-y-10 before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10" aria-label="Disclosure status timeline">
                {statusSteps.map((step, i) => {
                  const complete = i <= currentIndex;
                  const active = i === currentIndex;
                  return (
                    <div key={step.key} className="relative transition-all duration-700">
                      <span className={`absolute -left-[27px] top-0 flex items-center justify-center w-6 h-6 rounded-full border shadow-2xl transition-all duration-500 ${
                        active ? "bg-primary text-primary-foreground border-primary scale-125 neon-glow" : 
                        complete ? "bg-primary/20 text-primary border-primary/30" : 
                        "bg-black text-muted-foreground border-white/10"
                      }`}>
                        <step.icon className={`h-3.5 w-3.5 ${active ? "animate-pulse" : ""}`} />
                      </span>
                      <div className="space-y-1.5">
                        <h3 className={`text-sm font-bold uppercase tracking-widest font-sans transition-colors duration-500 ${complete ? "text-primary" : "text-muted-foreground"}`}>
                          {step.label}
                        </h3>
                        {i === 0 && complaint.created_at && (
                          <p className="text-[10px] font-mono opacity-40 uppercase tracking-tighter">
                            Authenticated: {new Date(complaint.created_at).toLocaleString()}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground/70 font-sans leading-relaxed max-w-md">{step.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default SelfReportingTracker;
