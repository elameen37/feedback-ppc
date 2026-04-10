import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle2, Clock, UserCheck, MessageSquare, FolderClosed, Loader2, AlertCircle, Shield, Activity, Calendar, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type ComplaintCategory = Database["public"]["Enums"]["complaint_category"];
const SELF_REPORT_CATEGORIES: ComplaintCategory[] = ["self_report_officer", "self_report_individual", "self_report_organization"];

const statusSteps = [
  { key: "submitted", label: "Disclosure Logged", note: "Self-reporting disclosure has been securely transmitted and encrypted within the ICPC vault.", icon: CheckCircle2 },
  { key: "under_review", label: "Confidential Review", note: "Preliminary assessment and validation of disclosure under forensic review.", icon: Clock },
  { key: "assigned", label: "Review Officer Sync", note: "Allocated to a specialized review officer for evaluative analysis.", icon: UserCheck },
  { key: "responded", label: "Entity Response", note: "Formal communication regarding the disclosure status initiated.", icon: MessageSquare },
  { key: "closed", label: "Resolution Applied", note: "Official determination reached and investigative file archived.", icon: FolderClosed },
];

const statusOrder = statusSteps.map(s => s.key);

const SelfReportingTracker = () => {
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
      .select("id, status, created_at, tracking_id, category")
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
    <section className="py-20 sm:py-24 bg-mesh relative overflow-hidden" aria-labelledby="sr-track-title">
      <div className="container px-4 sm:px-6 max-w-4xl relative z-20">
        <div className="text-center mb-16 animate-reveal">
          <Badge variant="outline" className="mb-4 border-accent/20 bg-accent/5 text-accent tracking-widest uppercase text-[10px] py-1 px-4">Confidential Portal</Badge>
          <h2 id="sr-track-title" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Track Disclosure Phase
          </h2>
          <p className="text-muted-foreground font-sans max-w-xl mx-auto">
            Input your encrypted reference ID to synchronize with the official confidentiality milestone path.
          </p>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl mb-12 shadow-2xl animate-reveal stagger-1">
          <CardContent className="p-8">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="sr-track-ref" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Secure Disclosure ID</Label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
                  <Input
                    id="sr-track-ref"
                    placeholder="e.g. ICPC-SR-2026-XYZ789"
                    className="glass-card bg-background/40 h-14 pl-12 border-white/5 focus-visible:ring-accent font-mono text-lg"
                    value={refId}
                    onChange={(e) => { setRefId(e.target.value); setNotFound(false); }}
                    maxLength={30}
                  />
                </div>
              </div>
              <Button type="submit" className="md:mt-7 h-14 px-10 font-sans gap-2 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 text-md font-bold transition-all active:scale-95" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                {loading ? "Decrypting Sync..." : "Synchronize Phase"}
              </Button>
            </form>

            {notFound && (
              <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-reveal">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm font-bold text-destructive font-sans">Verification Failed: Secure ID not recognized in the vault.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {complaint && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
               <Card className="glass-card border-white/5 bg-accent/5 animate-reveal stagger-2">
                 <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 font-sans">Disclosure Profile</p>
                    <div className="space-y-4">
                       <div>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-sans">Confidential ID</p>
                          <p className="text-lg font-mono font-bold text-foreground">{complaint.tracking_id}</p>
                       </div>
                       <div>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-sans">Current Phase</p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                             <Badge className="bg-accent text-white uppercase text-[10px] font-bold tracking-widest px-3">
                                {statusSteps[currentIndex]?.label || complaint.status}
                             </Badge>
                          </div>
                       </div>
                    </div>
                 </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-2 px-1 animate-reveal stagger-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground font-sans">Confidential Milestone Track</h3>
              </div>
              
              <div className="relative space-y-3 pl-4 before:absolute before:left-0 before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-accent/40 before:via-accent/10 before:to-transparent">
                {statusSteps.map((step, i) => {
                  const isCompleted = i < currentIndex;
                  const isCurrent = i === currentIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className={`relative animate-reveal stagger-${i + 3}`}>
                      <div className={`absolute -left-[20px] top-4 w-2.5 h-2.5 rounded-full ring-4 ring-background shadow-sm transition-all duration-500 ${
                        isCompleted ? "bg-accent" : 
                        isCurrent ? "bg-accent animate-pulse h-3 w-3 -left-[21px]" : 
                        "bg-muted"
                      }`} />
                      
                      <div className={`glass-card p-6 border-white/5 transition-all duration-300 ${
                        isCurrent ? "bg-accent/5 border-accent/20 scale-[1.02] shadow-xl shadow-accent/5" : 
                        isCompleted ? "bg-white/5 opacity-80" : 
                        "bg-transparent opacity-40 grayscale"
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isCurrent ? 'bg-accent/20 text-accent' : isCompleted ? 'bg-accent/10 text-accent/70' : 'bg-white/5 text-muted-foreground'}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <p className={`text-sm font-bold font-sans ${isCurrent ? "text-accent text-lg" : "text-foreground"}`}>
                              {step.label}
                            </p>
                          </div>
                          {isCompleted && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent opacity-60 font-sans bg-accent/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              VERIFIED
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

export default SelfReportingTracker;
