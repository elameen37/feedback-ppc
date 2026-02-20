import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Loader2 } from "lucide-react";
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
      anonymous: user ? false : true,
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {submittedTrackingId && (
        <TrackingIdBanner trackingId={submittedTrackingId} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="org-name" className="font-sans">Organization Name *</Label>
          <Input id="org-name" placeholder="Enter organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} maxLength={200} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-rc" className="font-sans">RC Number</Label>
          <Input id="org-rc" placeholder="e.g. RC 123456" value={rcNumber} onChange={(e) => setRcNumber(e.target.value)} maxLength={20} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-officer" className="font-sans">Compliance Officer Name *</Label>
        <Input id="org-officer" placeholder="Name of the compliance or reporting officer" value={complianceOfficer} onChange={(e) => setComplianceOfficer(e.target.value)} maxLength={100} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-desc" className="font-sans">Description of Irregularity *</Label>
        <Textarea id="org-desc" placeholder="Describe the internal irregularity or compliance failure..." rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-steps" className="font-sans">Internal Corrective Steps Taken</Label>
        <Textarea id="org-steps" placeholder="Describe any corrective actions your organization has already taken..." rows={3} value={correctiveSteps} onChange={(e) => setCorrectiveSteps(e.target.value)} maxLength={3000} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-file" className="font-sans">Attach Internal Audit Reports</Label>
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <Input id="org-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" className="font-sans" />
        </div>
        <p className="text-xs text-muted-foreground font-sans">Accepted: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (max 10MB)</p>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox id="org-declare" checked={declared} onCheckedChange={(c) => setDeclared(c === true)} />
        <Label htmlFor="org-declare" className="text-sm font-sans leading-relaxed cursor-pointer">
          I confirm that this disclosure is truthful and accurate. I understand that the ICPC may initiate
          further investigation based on the information provided, and that voluntary disclosure may be
          considered favourably under the ICPC Act. *
        </Label>
      </div>

      <div className="space-y-2">
        <Label className="font-sans">Security Check *</Label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium bg-muted px-3 py-2 rounded font-sans">{captchaA} + {captchaB} = ?</span>
          <Input className="w-24" placeholder="Answer" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} maxLength={5} />
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto font-sans gap-2" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Submitting..." : "Submit Disclosure"}
      </Button>
    </form>
  );
};

export default OrganizationalForm;
