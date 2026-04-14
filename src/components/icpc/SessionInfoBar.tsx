import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Shield } from "lucide-react";

interface SessionInfoBarProps {
  userEmail: string;
  role: "admin" | "officer" | null;
  sessionStartTime: string;
}

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const SessionInfoBar = ({ userEmail, role, sessionStartTime }: SessionInfoBarProps) => {
  const [duration, setDuration] = useState("");

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - new Date(sessionStartTime).getTime();
      setDuration(formatDuration(elapsed));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] font-sans">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10">
        <User className="h-3 w-3 text-primary" />
        <span className="font-bold text-muted-foreground truncate max-w-[180px]">{userEmail}</span>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10">
        <Shield className="h-3 w-3 text-primary" />
        <span className="font-bold uppercase tracking-widest text-muted-foreground">
          {role || "Pending"}
        </span>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10">
        <Clock className="h-3 w-3 text-primary" />
        <span className="font-bold text-muted-foreground">
          Session: {duration}
        </span>
      </div>
      <Badge variant="outline" className="text-[9px] border-primary/10 bg-primary/5 text-muted-foreground font-bold tracking-widest uppercase">
        Login: {new Date(sessionStartTime).toLocaleTimeString()}
      </Badge>
    </div>
  );
};

export default SessionInfoBar;
