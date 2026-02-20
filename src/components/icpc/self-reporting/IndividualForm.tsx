import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Upload, Loader2 } from "lucide-react";
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
    const { error } = await supabase.from("complaints").insert({
      tracking_id: trackingId,
      anonymous,
      submitter_id: user?.id ?? null,
      submitter_name: anonymous ? null : fullName || null,
      submitter_contact: anonymous ? null : contact || null,
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
      setFullName(""); setContact(""); setDescription("");
      setCaseRef(""); setOthersInvolved(""); setCaptchaAnswer("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submittedTrackingId && (
        <TrackingIdBanner trackingId={submittedTrackingId} />
      )}

      <div className="flex items-center gap-3 p-3 rounded-md bg-icpc-green-light">
        <Shield className="h-5 w-5 text-primary shrink-0" />
        <div className="flex items-center gap-2">
          <Switch id="ind-anonymous" checked={anonymous} onCheckedChange={setAnonymous} aria-label="Submit anonymously" />
          <Label htmlFor="ind-anonymous" className="text-sm font-sans cursor-pointer">
            Submit anonymously (your identity will be protected)
          </Label>
        </div>
      </div>

      {!anonymous && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ind-name" className="font-sans">Full Name (optional)</Label>
            <Input id="ind-name" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ind-contact" className="font-sans">Contact Information</Label>
            <Input id="ind-contact" placeholder="Email or phone number" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={150} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="ind-desc" className="font-sans">Description of Involvement *</Label>
        <Textarea id="ind-desc" placeholder="Describe your involvement in the corruption-related matter..." rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ind-caseref" className="font-sans">Related Case Reference (if any)</Label>
          <Input id="ind-caseref" placeholder="e.g. ICPC-2026-XXXXXX" value={caseRef} onChange={(e) => setCaseRef(e.target.value)} maxLength={30} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ind-others" className="font-sans">Others Involved</Label>
          <Input id="ind-others" placeholder="Names of other persons involved" value={othersInvolved} onChange={(e) => setOthersInvolved(e.target.value)} maxLength={300} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ind-file" className="font-sans">Upload Evidence</Label>
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <Input id="ind-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="font-sans" />
        </div>
        <p className="text-xs text-muted-foreground font-sans">Accepted: PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
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

export default IndividualForm;
