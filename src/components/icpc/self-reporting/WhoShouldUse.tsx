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
    <section className="py-10 sm:py-16 bg-muted" aria-labelledby="who-title">
      <div className="container px-4 sm:px-6 max-w-5xl">
        <div className="text-center mb-8">
          <h2
            id="who-title"
            className="text-2xl md:text-3xl font-bold text-primary mb-3"
          >
            Who Should Use This Portal
          </h2>
          <p className="text-muted-foreground font-sans max-w-2xl mx-auto">
            This portal is intended for individuals, public officers, and
            organizations seeking to voluntarily disclose misconduct and
            cooperate with the ICPC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {items.map((item, index) => (
            <div
              key={item.title}
              className={`flex flex-col items-center text-center gap-4 bg-background glass-card rounded-2xl p-6 border-white/5 animate-reveal stagger-${index + 1}`}
            >
              <div className="shrink-0 h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-2">
                <item.icon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary mb-2 font-sans">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card animate-reveal stagger-4 border-accent/20 bg-accent/5 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="md:max-w-xs shrink-0">
              <h3 className="font-bold text-2xl text-primary mb-2 font-sans">
                Your Rights & <br /> <span className="text-accent">Protections</span>
              </h3>
              <p className="text-sm text-muted-foreground font-sans">
                Voluntary disclosure is protected under the Corrupt Practices Act, ensuring due process.
              </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium text-primary/80 font-sans flex-1">
              <li className="flex items-center gap-3 bg-background/50 p-3 rounded-lg border border-white/5">
                <Shield className="h-5 w-5 text-accent" />
                Strict confidentiality of submissions
              </li>
              <li className="flex items-center gap-3 bg-background/50 p-3 rounded-lg border border-white/5">
                <Scale className="h-5 w-5 text-accent" />
                Due process guaranteed (ICPC Act)
              </li>
              <li className="flex items-center gap-3 bg-background/50 p-3 rounded-lg border border-white/5">
                <Handshake className="h-5 w-5 text-accent" />
                Legal review before any action
              </li>
              <li className="flex items-center gap-3 bg-background/50 p-3 rounded-lg border border-white/5">
                <Users className="h-5 w-5 text-accent" />
                Whistleblower protection rights
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoShouldUse;
