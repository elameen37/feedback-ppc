import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Shield, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { sendNotification } from "@/lib/notifications";
import TrackingIdBanner from "@/components/icpc/TrackingIdBanner";

type ComplaintCategory = Database["public"]["Enums"]["complaint_category"];

const generateTrackingId = () => {
  const prefix = "ICPC";
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
};

const useCaptcha = () => {
  const [a] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [b] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [answer, setAnswer] = useState("");
  const isValid = parseInt(answer) === a + b;
  return { question: `${a} + ${b} = ?`, answer, setAnswer, isValid };
};

const ComplainantForm = () => {
  const [anonymous, setAnonymous] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);
  const captcha = useCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description.trim()) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!captcha.isValid) {
      toast({ title: "CAPTCHA Failed", description: "Please solve the arithmetic question correctly.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const trackingId = generateTrackingId();
    const { data: { user } } = await supabase.auth.getUser();
    const isAnon = anonymous || !user;
    const { error } = await supabase.from("complaints").insert({
      tracking_id: trackingId,
      anonymous: isAnon,
      submitter_id: user?.id ?? null,
      submitter_name: isAnon ? null : name || null,
      submitter_contact: isAnon ? null : contact || null,
      category: category as ComplaintCategory,
      description: description.trim(),
      submission_type: "complainant",
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Submission Error", description: error.message, variant: "destructive" });
    } else {
      sendNotification({
        type: "new_submission",
        complaint_id: "",
        tracking_id: trackingId,
        category,
        description: description.trim().substring(0, 200),
        submitter_email: anonymous ? undefined : contact || undefined,
      });
      setSubmittedTrackingId(trackingId);
      setCategory("");
      setDescription("");
      setName("");
      setContact("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submittedTrackingId && (
        <TrackingIdBanner trackingId={submittedTrackingId} />
      )}

      <div className="flex items-center gap-3 p-5 rounded-2xl glass-card bg-accent/5 border-accent/20 animate-reveal stagger-1">
        <Shield className="h-6 w-6 text-accent shrink-0" />
        <div className="flex items-center gap-2">
          <Switch id="anonymous" checked={anonymous} onCheckedChange={setAnonymous} aria-label="Submit anonymously" />
          <Label htmlFor="anonymous" className="text-sm font-sans cursor-pointer font-bold text-primary/80">
            Submit anonymously (your identity will be protected)
          </Label>
        </div>
      </div>

      {!anonymous && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal stagger-2">
          <div className="space-y-2">
            <Label htmlFor="comp-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Full Name</Label>
            <Input id="comp-name" placeholder="Enter your full name" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-contact" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Government Email / Phone</Label>
            <Input id="comp-contact" placeholder="email@example.com or 080..." className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={150} />
          </div>
        </div>
      )}

      <div className="space-y-2 animate-reveal stagger-3">
        <Label htmlFor="comp-category" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Complaint Classification *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="comp-category" className="glass-card bg-background/40 h-12 border-white/5 focus:ring-accent">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            <SelectItem value="corruption">Corruption</SelectItem>
            <SelectItem value="abuse_of_office">Abuse of Office</SelectItem>
            <SelectItem value="misconduct">Misconduct by Public Officials</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 animate-reveal stagger-4">
        <Label htmlFor="comp-desc" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Incident Description *</Label>
        <div className="relative group">
           <Textarea id="comp-desc" className="glass-card bg-background/40 border-white/5 focus-visible:ring-accent resize-none min-h-[150px] p-4 text-sm leading-relaxed" placeholder="Provide a detailed description of the complaint..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
           <div className="absolute bottom-3 right-3 text-[9px] font-mono text-muted-foreground opacity-50">{description.length}/5000</div>
        </div>
      </div>

      <div className="space-y-2 animate-reveal stagger-5">
        <Label htmlFor="comp-file" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Evidence Attachments</Label>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer relative">
          <Upload className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
          <div className="flex-1">
             <p className="text-xs font-sans font-medium">Click to upload or drag & drop</p>
             <p className="text-[9px] text-muted-foreground font-sans">PDF, DOC, JPG, PNG (max 10MB)</p>
          </div>
          <Input id="comp-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-black/10 border border-white/5 animate-reveal stagger-6">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block font-sans">Human Verification *</Label>
        <div className="flex items-center gap-4">
          <div className="h-11 px-4 flex items-center bg-primary text-white font-mono font-bold rounded-xl shadow-inner tracking-tighter">
            {captcha.question}
          </div>
          <Input className="w-32 h-11 glass-card bg-background/40 border-white/5 text-center font-mono text-lg focus-visible:ring-accent" placeholder="Result" value={captcha.answer} onChange={(e) => captcha.setAnswer(e.target.value)} maxLength={5} />
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto font-sans gap-2 h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 animate-reveal stagger-6" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
        {submitting ? "Processing Submission..." : "Dispatch Secure Complaint"}
      </Button>
    </form>
  );
};

const RespondentForm = () => {
  const [refId, setRefId] = useState("");
  const [name, setName] = useState("");
  const [response, setResponse] = useState("");
  const [declared, setDeclared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refId.trim() || !name.trim() || !response.trim()) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!declared) {
      toast({ title: "Declaration Required", description: "You must confirm the truthfulness of your response.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const trackingId = generateTrackingId();
    const { error } = await supabase.from("complaints").insert({
      tracking_id: trackingId,
      anonymous: true,
      submitter_name: name.trim(),
      category: "misconduct" as ComplaintCategory,
      description: response.trim(),
      submission_type: "respondent",
      reference_id: refId.trim(),
      response_text: response.trim(),
      declaration_confirmed: true,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Submission Error", description: error.message, variant: "destructive" });
    } else {
      sendNotification({
        type: "new_submission",
        complaint_id: "",
        tracking_id: trackingId,
        category: "misconduct",
        description: response.trim().substring(0, 200),
      });
      setSubmittedTrackingId(trackingId);
      setRefId("");
      setName("");
      setResponse("");
      setDeclared(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submittedTrackingId && (
        <TrackingIdBanner trackingId={submittedTrackingId} />
      )}
      <div className="space-y-2 animate-reveal stagger-1">
        <Label htmlFor="resp-ref" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Case Reference ID *</Label>
        <Input id="resp-ref" placeholder="e.g. ICPC-2026-ABC123" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent font-mono" value={refId} onChange={(e) => setRefId(e.target.value)} maxLength={30} />
      </div>
      <div className="space-y-2 animate-reveal stagger-2">
        <Label htmlFor="resp-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Official Identity / Organisation *</Label>
        <Input id="resp-name" placeholder="Enter name or legal entity" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" value={name} onChange={(e) => setName(e.target.value)} maxLength={150} />
      </div>
      <div className="space-y-2 animate-reveal stagger-3">
        <Label htmlFor="resp-text" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Formal Response Body *</Label>
        <Textarea id="resp-text" placeholder="Provide your comprehensive official response..." className="glass-card bg-background/40 border-white/5 focus-visible:ring-accent resize-none min-h-[180px] p-4 text-sm leading-relaxed" value={response} onChange={(e) => setResponse(e.target.value)} maxLength={5000} />
      </div>
      <div className="space-y-2 animate-reveal stagger-4">
        <Label htmlFor="resp-file" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Supporting Attachments</Label>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer relative">
          <Upload className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
          <div className="flex-1">
             <p className="text-xs font-sans font-medium">Upload official documents</p>
             <p className="text-[9px] text-muted-foreground font-sans">Secure PDF/DOC transmission (max 10MB)</p>
          </div>
          <Input id="resp-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-reveal stagger-5">
        <Checkbox id="resp-declare" checked={declared} onCheckedChange={(c) => setDeclared(c === true)} className="mt-1 border-primary/30" />
        <Label htmlFor="resp-declare" className="text-[11px] font-sans leading-relaxed cursor-pointer font-medium text-foreground/80">
          I formally declare that the information provided in this response is truthful and exhaustive. 
          Misleading the Commission may attract severe legal consequences under the ICPC Act.
        </Label>
      </div>
      <Button type="submit" className="w-full md:w-auto font-sans gap-2 h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 animate-reveal stagger-6" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {submitting ? "Transmitting..." : "Submit Formal Response"}
      </Button>
    </form>
  );
};

const PublicInterestForm = () => {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !message.trim()) {
      toast({ title: "Validation Error", description: "Please select a topic and enter your message.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const trackingId = generateTrackingId();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("complaints").insert({
      tracking_id: trackingId,
      anonymous: !user,
      submitter_id: user?.id ?? null,
      category: topic as ComplaintCategory,
      description: message.trim(),
      submission_type: "public_interest",
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Submission Error", description: error.message, variant: "destructive" });
    } else {
      sendNotification({
        type: "new_submission",
        complaint_id: "",
        tracking_id: trackingId,
        category: topic,
        description: message.trim().substring(0, 200),
      });
      setSubmittedTrackingId(trackingId);
      setTopic("");
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submittedTrackingId && (
        <TrackingIdBanner trackingId={submittedTrackingId} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal stagger-1">
        <div className="space-y-2">
          <Label htmlFor="pub-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Full Name (Optional)</Label>
          <Input id="pub-name" placeholder="Leave blank for anonymity" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pub-contact" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Return Contact (Optional)</Label>
          <Input id="pub-contact" placeholder="Email for follow-up" className="glass-card bg-background/40 h-12 border-white/5 focus-visible:ring-accent" maxLength={150} />
        </div>
      </div>
      <div className="space-y-2 animate-reveal stagger-2">
        <Label htmlFor="pub-topic" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Feedback Subject *</Label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger id="pub-topic" className="glass-card bg-background/40 h-12 border-white/5 focus:ring-accent">
            <SelectValue placeholder="What are you sharing?" />
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            <SelectItem value="policy_suggestion">Policy Suggestion</SelectItem>
            <SelectItem value="public_service_concern">Public Service Concern</SelectItem>
            <SelectItem value="anti_corruption_idea">Anti-Corruption Idea</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 animate-reveal stagger-3">
        <Label htmlFor="pub-message" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block font-sans">Detailed Message *</Label>
        <Textarea id="pub-message" placeholder="Share your insights, suggestions, or observations..." className="glass-card bg-background/40 border-white/5 focus-visible:ring-accent resize-none min-h-[160px] p-4 text-sm leading-relaxed" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} />
      </div>
      <Button type="submit" className="w-full md:w-auto font-sans h-12 px-10 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 animate-reveal stagger-4" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {submitting ? "Sharing..." : "Share Public Insight"}
      </Button>
    </form>
  );
};

const FeedbackForms = () => {
  return (
    <section id="submit" className="py-10 sm:py-16 bg-background" aria-labelledby="submit-title">
      <div className="container px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-10">
          <h2 id="submit-title" className="text-2xl md:text-3xl font-bold text-primary mb-3">
            Submit Your Feedback
          </h2>
          <p className="text-muted-foreground font-sans">
            Select the appropriate category below and complete the form. All fields marked with * are required.
          </p>
        </div>
        <Card className="glass-card border-white/5 animate-reveal stagger-1">
          <CardContent className="pt-8">
            <Tabs defaultValue="complainant" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-8 h-auto p-1.5 bg-muted/50 rounded-xl">
                <TabsTrigger value="complainant" className="font-sans text-[10px] sm:text-xs md:text-sm py-3 px-1 sm:px-3 rounded-lg data-[state=active]:shadow-lg">Complainants</TabsTrigger>
                <TabsTrigger value="respondent" className="font-sans text-[10px] sm:text-xs md:text-sm py-3 px-1 sm:px-3 rounded-lg data-[state=active]:shadow-lg">Respondents</TabsTrigger>
                <TabsTrigger value="public" className="font-sans text-[10px] sm:text-xs md:text-sm py-3 px-1 sm:px-3 rounded-lg data-[state=active]:shadow-lg">Public Interest</TabsTrigger>
              </TabsList>
              <TabsContent value="complainant">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg text-primary">Report Corruption or Misconduct</CardTitle>
                  <CardDescription className="font-sans">
                    Use this form to report corruption, abuse of office, or misconduct by public officials. You may submit anonymously.
                  </CardDescription>
                </CardHeader>
                <ComplainantForm />
              </TabsContent>
              <TabsContent value="respondent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg text-primary">Respond to a Query or Investigation</CardTitle>
                  <CardDescription className="font-sans">
                    Provide your official response to an existing complaint or investigation query.
                  </CardDescription>
                </CardHeader>
                <RespondentForm />
              </TabsContent>
              <TabsContent value="public">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg text-primary">Share Public Interest Feedback</CardTitle>
                  <CardDescription className="font-sans">
                    Contribute suggestions, concerns, or observations for public accountability.
                  </CardDescription>
                </CardHeader>
                <PublicInterestForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FeedbackForms;
