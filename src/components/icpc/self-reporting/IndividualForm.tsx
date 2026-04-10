import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Upload, Loader2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TrackingIdBanner from "@/components/icpc/TrackingIdBanner";

const generateTrackingId = () => {
  const prefix = "ICPC-SR";
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
};

const IndividualForm = () => {
  const [anonymous, setAnonymous] = useState(false);
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [caseRef, setCaseRef] = useState("");
  const [othersInvolved, setOthersInvolved] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);

  const [captchaA] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({ title: "Validation Error", description: "Please describe your involvement.", variant: "destructive" });
      return;
    }
    if (parseInt(captchaAnswer) !== captchaA + captchaB) {
      toast({ title: "CAPTCHA Failed", description: "Please solve the arithmetic question correctly.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const trackingId = generateTrackingId();
    const fullDescription = `${description.trim()}${othersInvolved ? `\n\nOthers Involved: ${othersInvolved}` : ""}${caseRef ? `\nRelated Case Ref: ${caseRef}` : ""}`;
    const { data: { user } } = await supabase.auth.getUser();
    const isAnon = anonymous || !user;
    const { error } = await supabase.from("complaints").insert({
      tracking_id: trackingId,
      anonymous: isAnon,
      submitter_id: user?.id ?? null,
      submitter_name: isAnon ? null : fullName || null,
      submitter_contact: isAnon ? null : contact || null,
      category: "self_report_individual",
      description: fullDescription.trim(),
      submission_type: "self_report",
      reference_id: caseRef || null,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Submission Error", description: error.message, variant: "destructive" });
    } else {
      setSubmittedTrackingId(trackingId);
      setFullName(""); 
      setContact(""); 
      setDescription("");
      setCaseRef(""); 
      setOthersInvolved(""); 
      setCaptchaAnswer("");
      setAnonymous(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submittedTrackingId && (
        <TrackingIdBanner trackingId={submittedTrackingId} />
      )}

      <div className="flex items-center gap-3 p-5 rounded-2xl glass-card bg-accent/5 border-accent/20 animate-reveal stagger-1">
        <Shield className="h-5 w-5 text-accent shrink-0" />
        <div className="flex items-center gap-2">
          <Switch id="ind-anonymous" checked={anonymous} onCheckedChange={setAnonymous} aria-label="Submit anonymously" />
          <Label htmlFor="ind-anonymous" className="text-sm font-sans cursor-pointer font-bold text-primary/80">
            Submit anonymously (your identity will be protected)
          </Label>
        </div>
      </div>

      {!anonymous && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal stagger-2">
          <div className="space-y-2">
            <Label htmlFor="ind-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Full Legal Name (Optional)</Label>
            <Input id="ind-name" placeholder="Enter your full name" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ind-contact" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Secure Contact Channel</Label>
            <Input id="ind-contact" placeholder="Email or encrypted phone" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={150} />
          </div>
        </div>
      )}

      <div className="space-y-2 animate-reveal stagger-3">
        <Label htmlFor="ind-desc" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Statement of Involvement *</Label>
        <div className="relative group">
          <Textarea id="ind-desc" placeholder="Describe your involvement in the corruption-related matter with complete honesty..." className="glass-card bg-background/40 border-white/5 focus-visible:ring-accent resize-none min-h-[160px] p-4 text-sm leading-relaxed" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
          <div className="absolute bottom-3 right-3 text-[9px] font-mono text-muted-foreground opacity-50">{description.length}/5000</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal stagger-4">
        <div className="space-y-2">
          <Label htmlFor="ind-caseref" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Related Intel Reference</Label>
          <Input id="ind-caseref" placeholder="e.g. ICPC-2026-XXXXXX" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent font-mono" value={caseRef} onChange={(e) => setCaseRef(e.target.value)} maxLength={30} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ind-others" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Co-conspirators / Others Involved</Label>
          <Input id="ind-others" placeholder="Identification of other parties" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={othersInvolved} onChange={(e) => setOthersInvolved(e.target.value)} maxLength={300} />
        </div>
      </div>

      <div className="space-y-2 animate-reveal stagger-5">
        <Label htmlFor="ind-file" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Verification Documents</Label>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer relative">
          <Upload className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
          <div className="flex-1">
             <p className="text-xs font-sans font-medium">Attach supporting files</p>
             <p className="text-[9px] text-muted-foreground font-sans">Secure transmission (max 10MB)</p>
          </div>
          <Input id="ind-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-black/10 border border-white/5 animate-reveal stagger-6">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block font-sans">Human verification Protocol *</Label>
        <div className="flex items-center gap-4">
          <div className="h-11 px-4 flex items-center bg-primary text-white font-mono font-bold rounded-xl shadow-inner tracking-tighter">
            {captchaA} + {captchaB} = ?
          </div>
          <Input className="w-32 h-11 glass-card bg-background/40 border-white/5 text-center font-mono text-lg focus-visible:ring-accent" placeholder="Result" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} maxLength={5} />
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto font-sans h-12 px-10 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 animate-reveal stagger-6 flex items-center gap-2" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
        {submitting ? "Processing Submission..." : "Dispatch Secure Disclosure"}
      </Button>
    </form>
  );
};

export default IndividualForm;
