import { FileText, MessageSquare, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";


const categories = [
  {
    icon: FileText,
    title: "Complainants",
    description: "Report corruption, abuse of office, or misconduct by public officials.",
    href: "/submit-feedback",
  },
  {
    icon: MessageSquare,
    title: "Respondents",
    description: "Respond to queries, investigations, or requests for clarification.",
    href: "/submit-feedback",
  },
  {
    icon: Users,
    title: "Public Interest",
    description: "Share policy suggestions, civic concerns, or anti-corruption ideas.",
    href: "/submit-feedback",
    color: "bg-blue-500/10 text-blue-500",
  },
];

const HeroSection = () => {
  return (
    <section id="home" className="bg-mesh relative overflow-hidden py-16 sm:py-20 md:py-28" aria-labelledby="hero-title">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="container px-4 sm:px-6 text-center animate-reveal">
        <h1
          id="hero-title"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-primary mb-6 leading-tight"
        >
          ICPC <span className="text-accent">Feedback</span> & <br className="hidden md:block" /> Complaint Portal
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 font-sans leading-relaxed">
          A transparent, secure, and state-of-the-art platform for submitting and tracking 
          legitimate reports and anti-corruption feedback.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((cat, index) => (
            <Link key={cat.title} to={cat.href} className={`group animate-reveal stagger-${index + 1}`}>
              <Card className="glass-card h-full border-white/5 hover:border-accent/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <CardContent className="pt-8 text-center bg-noise">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-6 transition-transform group-hover:scale-110 duration-500`}>
                    <cat.icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-bold text-primary mb-3">{cat.title}</h2>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">{cat.description}</p>
                </CardContent>
              </Card>
            </Link>
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
