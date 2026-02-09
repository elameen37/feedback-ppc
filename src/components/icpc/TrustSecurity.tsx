import { Lock, ShieldCheck, Database, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    icon: Lock,
    title: "Confidentiality",
    description: "All submissions are treated with the strictest confidentiality. Personal information is never disclosed without authorisation.",
  },
  {
    icon: ShieldCheck,
    title: "Whistleblower Protection",
    description: "Whistleblowers are fully protected under the ICPC Act. Anonymous submissions are accepted and identities safeguarded.",
  },
  {
    icon: Database,
    title: "Data Security",
    description: "Your data is secured using industry-standard encryption and stored on government-certified infrastructure.",
  },
  {
    icon: Scale,
    title: "ICPC's Legal Mandate",
    description: "The ICPC is constitutionally empowered under the Corrupt Practices and Other Related Offences Act, 2000 to receive and investigate complaints.",
  },
];

const TrustSecurity = () => {
  return (
    <section className="py-16 bg-icpc-gold-light" aria-labelledby="trust-title">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 id="trust-title" className="text-2xl md:text-3xl font-bold text-primary mb-3">
            Trust & Security
          </h2>
          <p className="text-muted-foreground font-sans">
            Your safety and privacy are our highest priority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <Card key={item.title} className="border-l-4 border-l-secondary">
              <CardContent className="pt-6 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground font-sans">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSecurity;
