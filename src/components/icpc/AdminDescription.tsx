import { Monitor, Filter, Clock, Download, ClipboardList } from "lucide-react";

const features = [
  { icon: Monitor, text: "Secure dashboard for managing all submissions" },
  { icon: Filter, text: "Filter by category, status, date, and assigned officer" },
  { icon: Clock, text: "SLA timers to ensure timely processing" },
  { icon: Download, text: "Export reports in PDF and CSV formats" },
  { icon: ClipboardList, text: "Full audit logs for compliance and accountability" },
];

const AdminDescription = () => {
  return (
    <section className="py-10 sm:py-16 bg-background relative overflow-hidden" aria-labelledby="admin-title">
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="container px-4 sm:px-6 max-w-3xl text-center relative z-10">
        <h2 id="admin-title" className="text-2xl md:text-3xl font-bold text-primary mb-3">
          Officer & Admin Dashboard
        </h2>
        <p className="text-muted-foreground font-sans mb-8">
          Authorised ICPC officers and administrators have access to a secure, role-based dashboard
          for managing submissions, tracking service-level agreements, and maintaining complete audit trails.
        </p>
        <div className="inline-flex flex-col items-start gap-4 text-left max-w-md mx-auto">
          {features.map((f) => (
            <div key={f.text} className="flex items-center gap-4 group">
              <div className="p-2 rounded-lg bg-white/5 text-primary group-hover:neon-glow transition-all">
                <f.icon className="h-5 w-5 shrink-0" />
              </div>
              <span className="text-sm text-foreground/80 font-sans group-hover:text-white transition-colors">{f.text}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground font-sans italic opacity-60">
          This dashboard is accessible only to authorised ICPC personnel and is not part of the public-facing portal.
        </p>
      </div>
    </section>
  );
};

export default AdminDescription;
