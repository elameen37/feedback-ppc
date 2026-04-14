import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface SessionTimeoutWarningProps {
  open: boolean;
  remainingSeconds: number;
  onExtend: () => void;
}

const SessionTimeoutWarning = ({ open, remainingSeconds, onExtend }: SessionTimeoutWarningProps) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm glass-card border-yellow-500/20 bg-background/95 backdrop-blur-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-yellow-500 animate-pulse" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            Session Expiring
          </DialogTitle>
          <DialogDescription className="text-center font-sans text-muted-foreground">
            Your session will expire due to inactivity. You will be logged out automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center my-4">
          <span className="text-3xl font-mono font-bold text-yellow-500">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
        <Button onClick={onExtend} className="w-full h-12 font-sans font-bold bg-primary hover:bg-primary/90 text-white">
          Continue Session
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeoutWarning;
