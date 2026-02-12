import { FileText, MessageSquare, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const categories = [
  {
    icon: FileText,
    title: "Complainants",
    description: "Report corruption, abuse of office, or misconduct by public officials.",
    href: "#submit",
  },
  {
    icon: MessageSquare,
    title: "Respondents",
    description: "Respond to queries, investigations, or requests for clarification.",
    href: "#submit",
  },
  {
    icon: Users,
    title: "Public Interest",
    description: "Share policy suggestions, civic concerns, or anti-corruption ideas.",
    href: "#submit",
  },
];

const HeroSection = () => {
  return (
    <section id="home" className="bg-icpc-green-light py-10 sm:py-16 md:py-24" aria-labelledby="hero-title">
      <div className="container px-4 sm:px-6 text-center">
        <h1
          id="hero-title"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 leading-tight"
        >
          ICPC Feedback & Complaint Tracking Portal
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 font-sans">
          A transparent, secure platform for submitting and tracking complaints,
          responses, and public interest reports.
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-8 font-sans">
          The Independent Corrupt Practices and Other Related Offences Commission (ICPC) is
          constitutionally mandated to receive and investigate complaints of corruption and
          related offences. Your feedback strengthens our commitment to accountability.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Button asChild size="lg" variant="default">
            <Link to="/track-complaint">Track Complaint</Link>
          </Button>
          <Button asChild size="lg" variant="accent">
            <Link to="/self-reporting#tracker">Track Disclosure</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <a key={cat.title} href={cat.href} className="group">
              <Card className="h-full border-2 border-transparent hover:border-accent transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-4">
                    <cat.icon className="h-7 w-7" />
                  </div>
                  <h2 className="text-lg font-bold text-primary mb-2">{cat.title}</h2>
                  <p className="text-sm text-muted-foreground font-sans">{cat.description}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground max-w-xl mx-auto font-sans italic">
          All submissions are treated with strict confidentiality. Whistleblower protection
          is guaranteed under the ICPC Act.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
