import { FileText, Hash, Search, MessageCircle } from "lucide-react";

const steps = [
  { icon: FileText, title: "Submit", description: "Complete the appropriate feedback form with your complaint, response, or suggestion." },
  { icon: Hash, title: "Get Reference ID", description: "Receive a unique tracking reference ID upon successful submission." },
  { icon: Search, title: "Track Progress", description: "Use your reference ID to monitor the status of your submission at any time." },
  { icon: MessageCircle, title: "Get Response", description: "Receive an official response once your submission has been reviewed and processed." },
];

const HowItWorks = () => {
  return (
    <section className="py-10 sm:py-16 bg-background relative" aria-labelledby="how-title">
      <div className="container px-4 sm:px-6 max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <h2 id="how-title" className="text-2xl md:text-3xl font-bold text-primary mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground font-sans">
            A simple, transparent process from submission to resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 text-primary mb-4 relative group-hover:neon-glow transition-all duration-300">
                <step.icon className="h-7 w-7" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center font-sans">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-white transition-colors">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-sans">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
