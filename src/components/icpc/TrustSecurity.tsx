import { Lock, ShieldCheck, Database, Scale } from "lucide-react";

const items = [
  {
    icon: Lock,
    title: "Confidentiality",
    description: "All submissions are treated with the strictest confidentiality. Personal information is never disclosed without authorisation.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: ShieldCheck,
    title: "Whistleblower Protection",
    description: "Whistleblowers are fully protected under the ICPC Act. Anonymous submissions are accepted and identities safeguarded.",
    color: "bg-green-500/10 text-green-500",
  },
  {
    icon: Database,
    title: "Data Security",
    description: "Your data is secured using industry-standard encryption and stored on government-certified infrastructure.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: Scale,
    title: "ICPC's Legal Mandate",
    description: "The ICPC is constitutionally empowered under the Corrupt Practices and Other Related Offences Act, 2000 to receive and investigate complaints.",
    color: "bg-accent/10 text-accent",
  },
];

const TrustSecurity = () => {
  return (
    <section className="py-10 sm:py-16 bg-mesh relative overflow-hidden" aria-labelledby="trust-title">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10 pointer-events-none" />
      <div className="container px-4 sm:px-6 max-w-5xl relative z-10">
        <div className="text-center mb-12 animate-reveal">
          <h2 id="trust-title" className="text-2xl md:text-3xl font-bold text-primary mb-3">
            Trust &amp; Security
          </h2>
          <p className="text-muted-foreground font-sans max-w-xl mx-auto">
            Your safety and privacy are our highest priority. Every submission is protected by law and technical safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <div
              key={item.title}
              className={`glass-card border-white/5 p-6 rounded-2xl flex gap-5 group hover:border-accent/30 transition-all duration-300 animate-reveal stagger-${index + 1}`}
            >
              <div className={`shrink-0 h-12 w-12 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-primary mb-1.5 font-sans">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSecurity;
