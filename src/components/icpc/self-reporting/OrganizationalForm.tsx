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

const OrganizationalForm = () => {
  const [orgName, setOrgName] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [complianceOfficer, setComplianceOfficer] = useState("");
  const [description, setDescription] = useState("");
  const [correctiveSteps, setCorrectiveSteps] = useState("");
  const [declared, setDeclared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);

  const [captchaA] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !complianceOfficer.trim() || !description.trim()) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!declared) {
      toast({ title: "Declaration Required", description: "You must confirm the truthfulness declaration.", variant: "destructive" });
      return;
    }
    if (parseInt(captchaAnswer) !== captchaA + captchaB) {
      toast({ title: "CAPTCHA Failed", description: "Please solve the arithmetic question correctly.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const trackingId = generateTrackingId();
    const fullDescription = `Organization: ${orgName}${rcNumber ? ` (RC: ${rcNumber})` : ""}\nCompliance Officer: ${complianceOfficer}\n\n${description}${correctiveSteps ? `\n\nCorrective Steps Taken:\n${correctiveSteps}` : ""}`;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("complaints").insert({
      tracking_id: trackingId,
      anonymous: !user,
      submitter_id: user?.id ?? null,
      submitter_name: complianceOfficer.trim(),
      category: "self_report_organization",
      description: fullDescription.trim(),
      submission_type: "self_report",
      declaration_confirmed: true,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Submission Error", description: error.message, variant: "destructive" });
    } else {
      setSubmittedTrackingId(trackingId);
      setOrgName(""); setRcNumber(""); setComplianceOfficer("");
      setDescription(""); setCorrectiveSteps(""); setDeclared(false); setCaptchaAnswer("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submittedTrackingId && (
        <TrackingIdBanner trackingId={submittedTrackingId} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal stagger-1">
        <div className="space-y-2">
          <Label htmlFor="org-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Corporate Legal Entity Name *</Label>
          <Input id="org-name" placeholder="Enter registration name" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={orgName} onChange={(e) => setOrgName(e.target.value)} maxLength={200} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-rc" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">RC Number / Registration ID</Label>
          <Input id="org-rc" placeholder="e.g. RC 123456" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent font-mono" value={rcNumber} onChange={(e) => setRcNumber(e.target.value)} maxLength={20} />
        </div>
      </div>

      <div className="space-y-2 animate-reveal stagger-2">
        <Label htmlFor="org-officer" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Reporting Compliance Officer *</Label>
        <Input id="org-officer" placeholder="Nominated officer for dispatch" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={complianceOfficer} onChange={(e) => setComplianceOfficer(e.target.value)} maxLength={100} />
      </div>

      <div className="space-y-2 animate-reveal stagger-3">
        <Label htmlFor="org-desc" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Classification of Irregularity *</Label>
        <div className="relative group">
          <Textarea id="org-desc" placeholder="Describe the internal irregularity or specific compliance failure identified..." className="glass-card bg-background/40 border-white/5 focus-visible:ring-accent resize-none min-h-[160px] p-4 text-sm leading-relaxed" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
          <div className="absolute bottom-3 right-3 text-[9px] font-mono text-muted-foreground opacity-50">{description.length}/5000</div>
        </div>
      </div>

      <div className="space-y-2 animate-reveal stagger-4">
        <Label htmlFor="org-steps" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Mitigation / Corrective Actions</Label>
        <Textarea id="org-steps" placeholder="Describe remedial protocol implemented by the organization..." className="glass-card bg-background/40 border-white/5 focus-visible:ring-accent resize-none min-h-[100px] p-4 text-sm leading-relaxed" value={correctiveSteps} onChange={(e) => setCorrectiveSteps(e.target.value)} maxLength={3000} />
      </div>

      <div className="space-y-2 animate-reveal stagger-5">
        <Label htmlFor="org-file" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Internal Audit Documentation</Label>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer relative">
          <Upload className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
          <div className="flex-1">
             <p className="text-xs font-sans font-medium">Attach official audit logs</p>
             <p className="text-[9px] text-muted-foreground font-sans">Secure XLS/PDF transmission (max 10MB)</p>
          </div>
          <Input id="org-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      </div>

      <div className="flex items-start gap-4 p-5 rounded-2xl bg-accent/5 border border-accent/20 animate-reveal stagger-6">
        <Checkbox id="org-declare" checked={declared} onCheckedChange={(c) => setDeclared(c === true)} className="mt-1 border-accent/30" />
        <Label htmlFor="org-declare" className="text-[11px] font-sans leading-relaxed cursor-pointer font-medium text-foreground/80">
          I formally confirm the accuracy of this corporate disclosure. We acknowledge that the ICPC may initiate
          administrative audits based on this data, as protected under the ICPC Disclosure Framework. *
        </Label>
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
        {submitting ? "Transmitting..." : "Submit Internal Disclosure"}
      </Button>
    </form>
  );
};

export default OrganizationalForm;
