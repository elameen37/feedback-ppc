import { useState } from "react";
import { CheckCircle2, Copy, Check, Shield } from "lucide-react";
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
        "rounded-2xl border border-green-500/20 bg-green-500/5 p-5 space-y-4 animate-reveal",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <p className="font-bold font-sans text-sm text-green-600">Submission Transmitted Successfully</p>
          <p className="text-[11px] text-muted-foreground font-sans">
            Your report has been securely received and encrypted.
          </p>
        </div>
      </div>

      {/* Tracking ID box */}
      <div className="glass-card rounded-xl border-white/10 bg-black/10 px-4 py-3 flex items-center gap-3">
        <Shield className="h-4 w-4 text-accent shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Reference ID</p>
          <p className="font-mono text-sm font-bold tracking-wider text-foreground truncate select-all">
            {trackingId}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className={`h-8 px-3 shrink-0 gap-1.5 font-sans text-xs rounded-lg transition-all ${
            copied ? "bg-green-500/10 text-green-600" : "hover:bg-white/10"
          }`}
          aria-label="Copy tracking ID"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground/70 font-sans text-center">
        Save this ID — you will need it to track your submission status.
      </p>
    </div>
  );
};

export default TrackingIdBanner;
