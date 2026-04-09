import { Shield, Scale, Users, Handshake } from "lucide-react";

const items = [
  {
    icon: Shield,
    title: "Public Officers",
    desc: "Seeking corrective compliance and voluntary disclosure of misconduct.",
  },
  {
    icon: Users,
    title: "Individuals",
    desc: "Wishing to voluntarily disclose involvement in corruption-related matters.",
  },
  {
    icon: Scale,
    title: "Organizations",
    desc: "Identifying and reporting internal irregularities or compliance failures.",
  },
  {
    icon: Handshake,
    title: "Cooperating Persons",
    desc: "Seeking cooperation with ICPC investigations in exchange for due process.",
  },
];

const WhoShouldUse = () => {
  return (
    <section className="py-10 sm:py-16 bg-background relative overflow-hidden" aria-labelledby="who-title">
      <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="container px-4 sm:px-6 max-w-5xl relative z-10">
        <div className="text-center mb-12">
          <h2
            id="who-title"
            className="text-2xl md:text-3xl font-bold text-primary mb-3 uppercase tracking-widest animate-neon-glow"
          >
            Who Should Use This Portal
          </h2>
          <p className="text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
            This portal is intended for individuals, public officers, and organizations seeking to voluntarily disclose misconduct and cooperate with the ICPC under a secure, digital-first framework.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 glass-panel rounded-xl p-6 border border-white/5 hover:border-primary/40 transition-all duration-300 group"
            >
              <div className="shrink-0 h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:neon-glow transition-all">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground mb-1 font-sans group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground font-sans opacity-80 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-panel border-white/10 rounded-xl p-8 shadow-2xl">
          <h3 className="font-bold text-sm text-primary mb-6 font-sans uppercase tracking-[0.2em] animate-pulse">
            Your Rights & Protections
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-muted-foreground font-sans">
            <li className="flex items-center gap-3 group">
              <span className="h-2 w-2 rounded-full bg-primary neon-glow shrink-0 group-hover:scale-125 transition-transform" />
              <span className="group-hover:text-white transition-colors">Strict confidentiality of all submissions</span>
            </li>
            <li className="flex items-center gap-3 group">
              <span className="h-2 w-2 rounded-full bg-primary neon-glow shrink-0 group-hover:scale-125 transition-transform" />
              <span className="group-hover:text-white transition-colors">Legal review before any action is taken</span>
            </li>
            <li className="flex items-center gap-3 group">
              <span className="h-2 w-2 rounded-full bg-primary neon-glow shrink-0 group-hover:scale-125 transition-transform" />
              <span className="group-hover:text-white transition-colors">Due process guaranteed under the ICPC Act</span>
            </li>
            <li className="flex items-center gap-3 group">
              <span className="h-2 w-2 rounded-full bg-primary neon-glow shrink-0 group-hover:scale-125 transition-transform" />
              <span className="group-hover:text-white transition-colors">Whistleblower protection rights</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WhoShouldUse;
