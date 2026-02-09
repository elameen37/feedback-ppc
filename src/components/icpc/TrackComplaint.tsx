import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle2, Clock, UserCheck, MessageSquare, FolderClosed } from "lucide-react";

const mockTimeline = [
  { status: "Submitted", date: "2026-01-15", note: "Complaint received and logged.", icon: CheckCircle2, complete: true },
  { status: "Under Review", date: "2026-01-18", note: "Preliminary assessment in progress.", icon: Clock, complete: true },
  { status: "Assigned", date: "2026-01-22", note: "Assigned to investigating officer.", icon: UserCheck, complete: true },
  { status: "Responded", date: "", note: "Awaiting response from relevant parties.", icon: MessageSquare, complete: false },
  { status: "Closed", date: "", note: "Case resolution pending.", icon: FolderClosed, complete: false },
];

const TrackComplaint = () => {
  const [refId, setRefId] = useState("");
  const [showTimeline, setShowTimeline] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (refId.trim().length >= 5) {
      setShowTimeline(true);
    }
  };

  return (
    <section id="track" className="py-16 bg-icpc-green-light" aria-labelledby="track-title">
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <h2 id="track-title" className="text-2xl md:text-3xl font-bold text-primary mb-3">
            Track Your Complaint
          </h2>
          <p className="text-muted-foreground font-sans">
            Enter your tracking reference ID to view the current status of your submission.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor="track-ref" className="sr-only">Tracking Reference ID</Label>
                <Input
                  id="track-ref"
                  placeholder="Enter Reference ID (e.g. ICPC-2026-ABC123)"
                  value={refId}
                  onChange={(e) => { setRefId(e.target.value); setShowTimeline(false); }}
                  maxLength={30}
                />
              </div>
              <Button type="submit" className="font-sans gap-2">
                <Search className="h-4 w-4" />
                Track
              </Button>
            </form>
          </CardContent>
        </Card>

        {showTimeline && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground font-sans mb-6">
                Showing status for: <strong className="text-foreground">{refId}</strong>
              </p>
              <ol className="relative border-l-2 border-primary/30 ml-4 space-y-8" aria-label="Complaint status timeline">
                {mockTimeline.map((step) => (
                  <li key={step.status} className="ml-6">
                    <span
                      className={`absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-background ${
                        step.complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <step.icon className="h-3.5 w-3.5" />
                    </span>
                    <h3 className={`text-sm font-bold font-sans ${step.complete ? "text-primary" : "text-muted-foreground"}`}>
                      {step.status}
                    </h3>
                    {step.date && (
                      <time className="text-xs text-muted-foreground font-sans">{step.date}</time>
                    )}
                    <p className="text-sm text-muted-foreground font-sans mt-1">{step.note}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default TrackComplaint;
