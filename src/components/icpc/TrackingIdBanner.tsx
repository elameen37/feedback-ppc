import { useState } from "react";
import { CheckCircle2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrackingIdBannerProps {
  trackingId: string;
  className?: string;
}

const TrackingIdBanner = ({ trackingId, className }: TrackingIdBannerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = trackingId;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="font-semibold font-sans text-sm">Submission Successful!</p>
      </div>

      <p className="text-xs text-muted-foreground font-sans">
        Save your tracking reference ID below. You'll need it to check the status of your submission.
      </p>

      <div className="flex items-center gap-2 bg-background rounded-md border border-border px-3 py-2">
        <span className="flex-1 font-mono text-sm font-bold tracking-wider text-foreground select-all">
          {trackingId}
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-7 px-2 shrink-0 gap-1 font-sans text-xs"
          aria-label="Copy tracking ID"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" />
              <span className="text-primary">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TrackingIdBanner;
