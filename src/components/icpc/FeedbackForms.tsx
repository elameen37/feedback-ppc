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
    const { error } = await supabase.from("complaints").insert({
      tracking_id: trackingId,
      anonymous,
      submitter_id: user?.id ?? null,
      submitter_name: anonymous ? null : name || null,
      submitter_contact: anonymous ? null : contact || null,
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

      <div className="flex items-center gap-3 p-3 rounded-md bg-icpc-green-light">
        <Shield className="h-5 w-5 text-primary shrink-0" />
        <div className="flex items-center gap-2">
          <Switch id="anonymous" checked={anonymous} onCheckedChange={setAnonymous} aria-label="Submit anonymously" />
          <Label htmlFor="anonymous" className="text-sm font-sans cursor-pointer">
            Submit anonymously (your identity will be protected)
          </Label>
        </div>
      </div>

      {!anonymous && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="comp-name" className="font-sans">Full Name</Label>
            <Input id="comp-name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-contact" className="font-sans">Email or Phone</Label>
            <Input id="comp-contact" placeholder="email@example.com or 080..." value={contact} onChange={(e) => setContact(e.target.value)} maxLength={150} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="comp-category" className="font-sans">Complaint Category *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="comp-category"><SelectValue placeholder="Select a category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="corruption">Corruption</SelectItem>
            <SelectItem value="abuse_of_office">Abuse of Office</SelectItem>
            <SelectItem value="misconduct">Misconduct by Public Officials</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comp-desc" className="font-sans">Description *</Label>
        <Textarea id="comp-desc" placeholder="Provide a detailed description of the complaint..." rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comp-file" className="font-sans">Supporting Documents</Label>
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <Input id="comp-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="font-sans" />
        </div>
        <p className="text-xs text-muted-foreground font-sans">Accepted: PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
      </div>

      <div className="space-y-2">
        <Label className="font-sans">Security Check *</Label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium bg-muted px-3 py-2 rounded font-sans">{captcha.question}</span>
          <Input className="w-24" placeholder="Answer" value={captcha.answer} onChange={(e) => captcha.setAnswer(e.target.value)} maxLength={5} />
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto font-sans gap-2" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Submitting..." : "Submit Complaint"}
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {submittedTrackingId && (
        <TrackingIdBanner trackingId={submittedTrackingId} />
      )}
      <div className="space-y-2">
        <Label htmlFor="resp-ref" className="font-sans">Reference ID *</Label>
        <Input id="resp-ref" placeholder="e.g. ICPC-2026-ABC123" value={refId} onChange={(e) => setRefId(e.target.value)} maxLength={30} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="resp-name" className="font-sans">Name / Organisation *</Label>
        <Input id="resp-name" placeholder="Enter name or organisation" value={name} onChange={(e) => setName(e.target.value)} maxLength={150} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="resp-text" className="font-sans">Response *</Label>
        <Textarea id="resp-text" placeholder="Provide your official response..." rows={5} value={response} onChange={(e) => setResponse(e.target.value)} maxLength={5000} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="resp-file" className="font-sans">Attachments</Label>
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <Input id="resp-file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="font-sans" />
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id="resp-declare" checked={declared} onCheckedChange={(c) => setDeclared(c === true)} />
        <Label htmlFor="resp-declare" className="text-sm font-sans leading-relaxed cursor-pointer">
          I confirm that this response is truthful and accurate to the best of my knowledge.
          I understand that providing false information may attract legal consequences under the ICPC Act.
        </Label>
      </div>
      <Button type="submit" className="w-full md:w-auto font-sans gap-2" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Submitting..." : "Submit Response"}
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
      anonymous: true,
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {submittedTrackingId && (
        <TrackingIdBanner trackingId={submittedTrackingId} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pub-name" className="font-sans">Name (optional)</Label>
          <Input id="pub-name" placeholder="Your name" maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pub-contact" className="font-sans">Contact (optional)</Label>
          <Input id="pub-contact" placeholder="Email or phone" maxLength={150} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pub-topic" className="font-sans">Topic *</Label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger id="pub-topic"><SelectValue placeholder="Select a topic" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="policy_suggestion">Policy Suggestion</SelectItem>
            <SelectItem value="public_service_concern">Public Service Concern</SelectItem>
            <SelectItem value="anti_corruption_idea">Anti-Corruption Idea</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pub-message" className="font-sans">Message *</Label>
        <Textarea id="pub-message" placeholder="Share your feedback, suggestion, or concern..." rows={5} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} />
      </div>
      <Button type="submit" className="w-full md:w-auto font-sans gap-2" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Submitting..." : "Submit Feedback"}
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
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="complainant" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6 h-auto">
                <TabsTrigger value="complainant" className="font-sans text-[10px] sm:text-xs md:text-sm py-2 px-1 sm:px-3">Complainants</TabsTrigger>
                <TabsTrigger value="respondent" className="font-sans text-[10px] sm:text-xs md:text-sm py-2 px-1 sm:px-3">Respondents</TabsTrigger>
                <TabsTrigger value="public" className="font-sans text-[10px] sm:text-xs md:text-sm py-2 px-1 sm:px-3">Public Interest</TabsTrigger>
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
