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
        "rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-5 space-y-4 shadow-2xl",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-primary animate-pulse">
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <p className="font-bold font-sans text-sm tracking-wide uppercase">Submission Successful!</p>
      </div>

      <p className="text-sm text-muted-foreground font-sans leading-relaxed">
        Save your tracking reference ID below. You'll need it to check the status of your submission securely.
      </p>

      <div className="flex items-center gap-3 bg-white/5 rounded-lg border border-white/10 px-4 py-3 group hover:border-primary/50 transition-all">
        <span className="flex-1 font-mono text-base font-bold tracking-[0.2em] text-white select-all">
          {trackingId}
        </span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          className="h-8 px-3 shrink-0 gap-2 font-bold font-sans text-xs rounded-md shadow-lg"
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
    </div>
  );
};

export default TrackingIdBanner;
