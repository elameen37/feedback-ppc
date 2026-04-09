import { FileText, MessageSquare, Users, Shield, Eye, Search, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const portalFeatures = [
  {
    icon: FileText,
    title: "Submit Feedback",
    description: "Report corruption, respond to investigations, or share public interest suggestions through structured, category-specific forms.",
    href: "/submit-feedback",
  },
  {
    icon: Search,
    title: "Track Complaints",
    description: "Monitor the status of your submitted complaints in real time using a unique reference ID — from submission through to resolution.",
    href: "/submit-feedback",
  },
  {
    icon: ClipboardList,
    title: "Self-Reporting & Asset Disclosure",
    description: "Voluntarily declare assets, income, and interests as an individual, organisation, or public officer. Track your disclosure status at any time.",
    href: "/self-reporting",
  },
];

const principles = [
  {
    icon: Shield,
    title: "Confidentiality & Protection",
    description: "All submissions are handled with strict confidentiality. Whistleblower identities are protected under the ICPC Act, and anonymous reporting is fully supported.",
  },
  {
    icon: Eye,
    title: "Transparency & Accountability",
    description: "Every submission follows a clear, trackable process — ensuring citizens can see how their reports are being handled from start to finish.",
  },
  {
    icon: Users,
    title: "Citizen-Centred Design",
    description: "The portal is designed for accessibility and ease of use across all devices, enabling every Nigerian citizen to participate in the fight against corruption.",
  },
];

const AboutSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-background overflow-hidden" aria-labelledby="about-title">
      <div className="container px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-reveal">
            <div className="max-w-2xl">
              <h2 id="about-title" className="text-sm font-bold tracking-widest text-accent uppercase mb-3">
                Platform Overview
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold text-primary leading-tight">
                Empowering Citizens through <br /> Transparent Reporting
              </h3>
            </div>
            <p className="text-muted-foreground font-sans max-w-sm">
              The ICPC Portal is the official digital channel for receiving and investigating 
              complaints of corruption and related offences.
            </p>
          </div>

          {/* Bento-style Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-20">
            {/* Main Feature - Large */}
            <Link to="/submit-feedback" className="md:col-span-6 lg:col-span-7 group animate-reveal stagger-1">
              <Card className="glass-card h-full border-accent/20 hover:border-accent transition-all duration-500 hover:shadow-2xl">
                <CardContent className="p-8 flex flex-col h-full bg-noise">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-primary mb-4">Submit Complaints</h4>
                  <p className="text-muted-foreground font-sans mb-8 flex-1">
                    Report corruption, abuse of office, or share public interest suggestions 
                    through structured, secure forms. All data is protected under the ICPC Act.
                  </p>
                  <div className="flex items-center text-accent font-bold gap-2 group-hover:gap-4 transition-all">
                    Start Reporting <ClipboardList className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Feature 2 - Medium */}
            <div className="md:col-span-6 lg:col-span-5 flex flex-col gap-6">
              <Link to="/submit-feedback" className="group animate-reveal stagger-2 flex-1">
                <Card className="glass-card border-icpc-gold-light/20 hover:border-accent transition-all duration-500">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Search className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary mb-1">Track Progress</h4>
                      <p className="text-sm text-muted-foreground font-sans">Real-time monitoring via Reference ID.</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/self-reporting" className="group animate-reveal stagger-3 flex-1">
                <Card className="glass-card border-icpc-green-light/20 hover:border-accent transition-all duration-500">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary mb-1">Asset Disclosure</h4>
                      <p className="text-sm text-muted-foreground font-sans">Voluntary asset declare & tracking.</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Guiding principles - refined row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto mb-16 animate-reveal">
            {principles.map((item, index) => (
              <div key={item.title} className={`text-left stagger-${index + 1}`}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground mb-6 shadow-lg shadow-primary/20">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground max-w-xl mx-auto font-sans italic">
          This portal is maintained by the ICPC in partnership with relevant government agencies.
          All data is secured on government-certified infrastructure.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
