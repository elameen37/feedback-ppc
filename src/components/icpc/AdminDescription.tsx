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
    <section className="py-10 sm:py-16 bg-background" aria-labelledby="admin-title">
      <div className="container px-4 sm:px-6 max-w-3xl text-center">
        <h2 id="admin-title" className="text-2xl md:text-3xl font-bold text-primary mb-3">
          Officer & Admin Dashboard
        </h2>
        <p className="text-muted-foreground font-sans mb-8">
          Authorised ICPC officers and administrators have access to a secure, role-based dashboard
          for managing submissions, tracking service-level agreements, and maintaining complete audit trails.
        </p>
        <div className="inline-flex flex-col items-start gap-3 text-left">
          {features.map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <f.icon className="h-5 w-5 text-secondary shrink-0" />
              <span className="text-sm text-foreground font-sans">{f.text}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground font-sans italic">
          This dashboard is accessible only to authorised ICPC personnel and is not part of the public-facing portal.
        </p>
      </div>
    </section>
  );
};

export default AdminDescription;
