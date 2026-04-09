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
    <section className="bg-background py-10 sm:py-16 md:py-24 relative overflow-hidden" aria-labelledby="about-title">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />
      
      <div className="container px-4 sm:px-6 relative z-10">
        {/* Hero intro */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1
            id="about-title"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 leading-tight animate-neon-glow"
          >
            About the ICPC Feedback & Complaint Tracking Portal
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-sans mb-6">
            A secure, transparent digital platform empowering Nigerian citizens to report corruption,
            track complaints, and contribute to national accountability.
          </p>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            The Independent Corrupt Practices and Other Related Offences Commission (ICPC) is
            constitutionally mandated under the Corrupt Practices and Other Related Offences Act, 2000
            to receive, investigate, and prosecute cases of corruption in Nigeria. This portal serves as the
            Commission's official digital channel for public engagement — enabling citizens, organisations,
            and public officers to submit reports, provide responses, and make voluntary disclosures with
            full confidence in the security and confidentiality of their information.
          </p>
        </div>

        {/* Portal features */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-primary text-center mb-8">
            What You Can Do on This Portal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {portalFeatures.map((feature) => (
              <Link key={feature.title} to={feature.href} className="group">
                <Card className="h-full glass-panel border-white/5 hover:border-primary/50 transition-all duration-300 group-hover:neon-glow group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardContent className="pt-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Guiding principles */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-primary text-center mb-8">
            Our Guiding Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((item) => (
              <div key={item.title} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 text-primary mb-4 group-hover:neon-glow transition-all">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-sans">{item.description}</p>
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
