import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  const [captchaA] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
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
    const trackingId = generateTrackingId();
    toast({
      title: "Disclosure Submitted",
      description: `Your tracking reference ID is: ${trackingId}. Please save this for future reference.`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="po-name" className="font-sans">Full Name *</Label>
          <Input id="po-name" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="po-position" className="font-sans">Position / Rank *</Label>
          <Input id="po-position" placeholder="e.g. Director, Grade Level 14" value={position} onChange={(e) => setPosition(e.target.value)} maxLength={100} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="po-mda" className="font-sans">Ministry / Department / Agency (MDA) *</Label>
        <Input id="po-mda" placeholder="e.g. Federal Ministry of Finance" value={mda} onChange={(e) => setMda(e.target.value)} maxLength={200} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="po-nature" className="font-sans">Nature of Misconduct *</Label>
        <Input id="po-nature" placeholder="e.g. Financial misappropriation, Contract inflation" value={nature} onChange={(e) => setNature(e.target.value)} maxLength={200} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="po-dates" className="font-sans">Date(s) of Misconduct</Label>
          <Input id="po-dates" type="date" value={dates} onChange={(e) => setDates(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="po-amount" className="font-sans">Amount Involved (if applicable)</Label>
          <Input id="po-amount" placeholder="e.g. ₦5,000,000" value={amount} onChange={(e) => setAmount(e.target.value)} maxLength={50} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="po-desc" className="font-sans">Detailed Description *</Label>
        <Textarea id="po-desc" placeholder="Provide a detailed account of the misconduct..." rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="po-file" className="font-sans">Supporting Documents</Label>
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <Input id="po-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="font-sans" />
        </div>
        <p className="text-xs text-muted-foreground font-sans">Accepted: PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox id="po-cooperation" checked={cooperation} onCheckedChange={(c) => setCooperation(c === true)} />
        <Label htmlFor="po-cooperation" className="text-sm font-sans leading-relaxed cursor-pointer">
          I hereby declare my willingness to cooperate fully with the ICPC in the investigation of this matter.
          I understand that voluntary disclosure may be considered favourably in accordance with the ICPC Act. *
        </Label>
      </div>

      <div className="space-y-2">
        <Label className="font-sans">Security Check *</Label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium bg-muted px-3 py-2 rounded font-sans">{captchaA} + {captchaB} = ?</span>
          <Input className="w-24" placeholder="Answer" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} maxLength={5} />
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto font-sans">Submit Disclosure</Button>
    </form>
  );
};

export default PublicOfficerForm;
