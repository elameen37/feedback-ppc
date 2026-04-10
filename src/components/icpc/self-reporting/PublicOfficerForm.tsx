import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Loader2, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TrackingIdBanner from "@/components/icpc/TrackingIdBanner";

const generateTrackingId = () => {
  const prefix = "ICPC-SR";
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
};

const PublicOfficerForm = () => {
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [mda, setMda] = useState("");
  const [nature, setNature] = useState("");
  const [dates, setDates] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [cooperation, setCooperation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);

  const [captchaA] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !position.trim() || !mda.trim() || !nature.trim() || !description.trim()) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!cooperation) {
      toast({ title: "Declaration Required", description: "You must confirm the cooperation declaration.", variant: "destructive" });
      return;
    }
    if (parseInt(captchaAnswer) !== captchaA + captchaB) {
      toast({ title: "CAPTCHA Failed", description: "Please solve the arithmetic question correctly.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const trackingId = generateTrackingId();
    const fullDescription = `Nature: ${nature}\nPosition: ${position}\nMDA: ${mda}${dates ? `\nDate(s): ${dates}` : ""}${amount ? `\nAmount: ${amount}` : ""}\n\n${description}`;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("complaints").insert({
      tracking_id: trackingId,
      anonymous: !user,
      submitter_id: user?.id ?? null,
      submitter_name: fullName.trim(),
      category: "self_report_officer",
      description: fullDescription.trim(),
      submission_type: "self_report",
      declaration_confirmed: true,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Submission Error", description: error.message, variant: "destructive" });
    } else {
      setSubmittedTrackingId(trackingId);
      setFullName(""); setPosition(""); setMda(""); setNature("");
      setDates(""); setAmount(""); setDescription(""); setCooperation(false);
      setCaptchaAnswer("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submittedTrackingId && (
        <TrackingIdBanner trackingId={submittedTrackingId} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal stagger-1">
        <div className="space-y-2">
          <Label htmlFor="po-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Full Legal Name *</Label>
          <Input id="po-name" placeholder="Enter your full name" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="po-position" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Official Position / Rank *</Label>
          <Input id="po-position" placeholder="e.g. Director, Grade Level 14" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={position} onChange={(e) => setPosition(e.target.value)} maxLength={100} />
        </div>
      </div>

      <div className="space-y-2 animate-reveal stagger-2">
        <Label htmlFor="po-mda" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Ministry / Department / Agency (MDA) *</Label>
        <Input id="po-mda" placeholder="e.g. Federal Ministry of Finance" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={mda} onChange={(e) => setMda(e.target.value)} maxLength={200} />
      </div>

      <div className="space-y-2 animate-reveal stagger-3">
        <Label htmlFor="po-nature" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Classification of Misconduct *</Label>
        <Input id="po-nature" placeholder="e.g. Financial misappropriation, Contract inflation" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={nature} onChange={(e) => setNature(e.target.value)} maxLength={200} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal stagger-4">
        <div className="space-y-2">
          <Label htmlFor="po-dates" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Primary Incident Date</Label>
          <Input id="po-dates" type="date" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent font-sans" value={dates} onChange={(e) => setDates(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="po-amount" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Financial Value (if applicable)</Label>
          <Input id="po-amount" placeholder="e.g. ₦5,000,000" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent font-mono" value={amount} onChange={(e) => setAmount(e.target.value)} maxLength={50} />
        </div>
      </div>

      <div className="space-y-2 animate-reveal stagger-5">
        <Label htmlFor="po-desc" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Detailed Investigative Narrative *</Label>
        <div className="relative group">
          <Textarea id="po-desc" placeholder="Provide a comprehensive and truthful account of the events..." className="glass-card bg-background/40 border-white/5 focus-visible:ring-accent resize-none min-h-[160px] p-4 text-sm leading-relaxed" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
          <div className="absolute bottom-3 right-3 text-[9px] font-mono text-muted-foreground opacity-50">{description.length}/5000</div>
        </div>
      </div>

      <div className="space-y-2 animate-reveal stagger-5">
        <Label htmlFor="po-file" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Corroborating Evidence</Label>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer relative">
          <Upload className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
          <div className="flex-1">
             <p className="text-xs font-sans font-medium">Attach digital evidence files</p>
             <p className="text-[9px] text-muted-foreground font-sans">Secure PDF/DOC/IMG transmission (max 10MB)</p>
          </div>
          <Input id="po-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      </div>

      <div className="flex items-start gap-4 p-5 rounded-2xl bg-accent/5 border border-accent/20 animate-reveal stagger-6">
        <Checkbox id="po-cooperation" checked={cooperation} onCheckedChange={(c) => setCooperation(c === true)} className="mt-1 border-accent/30" />
        <Label htmlFor="po-cooperation" className="text-[11px] font-sans leading-relaxed cursor-pointer font-medium text-foreground/80">
          I formally declare my willingness to participate in a full investigative audit and cooperate with the ICPC. 
          I understand that this disclosure is governed by the leniency provisions of the ICPC Act. *
        </Label>
      </div>

      <div className="p-6 rounded-2xl bg-black/10 border border-white/5 animate-reveal stagger-6">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block font-sans">Intelligence Verification *</Label>
        <div className="flex items-center gap-4">
          <div className="h-11 px-4 flex items-center bg-primary text-white font-mono font-bold rounded-xl shadow-inner tracking-tighter">
            {captchaA} + {captchaB} = ?
          </div>
          <Input className="w-32 h-11 glass-card bg-background/40 border-white/5 text-center font-mono text-lg focus-visible:ring-accent" placeholder="Result" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} maxLength={5} />
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto font-sans h-12 px-10 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 animate-reveal stagger-6 flex items-center gap-2" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
        {submitting ? "Processing Disclosure..." : "Transmit Secure Disclosure"}
      </Button>
    </form>
  );
};

export default PublicOfficerForm;
