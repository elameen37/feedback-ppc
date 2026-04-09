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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 bg-card rounded-lg p-5 border border-border"
            >
              <div className="shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground mb-1 font-sans">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground font-sans">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
          <h3 className="font-bold text-sm text-primary mb-2 font-sans">
            Your Rights & Protections
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground font-sans">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              Strict confidentiality of all submissions
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              Legal review before any action is taken
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              Due process guaranteed under the ICPC Act
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              Whistleblower protection rights
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WhoShouldUse;
