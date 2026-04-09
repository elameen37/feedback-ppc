import { useState } from "react";
import Header from "@/components/icpc/Header";
import Footer from "@/components/icpc/Footer";
import BackToTop from "@/components/icpc/BackToTop";
import WhoShouldUse from "@/components/icpc/self-reporting/WhoShouldUse";
import SelfReportingForms from "@/components/icpc/self-reporting/SelfReportingForms";
import TrackDisclosureDialog from "@/components/icpc/self-reporting/TrackDisclosureDialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SelfReporting = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />
      <main className="flex-1">
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-10 -z-10" />
          <div className="container px-4 sm:px-6 max-w-4xl text-center animate-reveal">
            <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-4">
              Voluntary Compliance
            </h2>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 text-primary leading-tight">
              Self-Reporting & <br /> Voluntary <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">Disclosure</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-sans max-w-2xl mx-auto mb-8 leading-relaxed">
              A secure platform for individuals and organisations to voluntarily disclose 
              misconduct and pursue corrective compliance under the ICPC Act.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="font-sans gap-2 glass-card hover:bg-secondary/80 transition-all"
                onClick={() => setDialogOpen(true)}
              >
                <Search className="h-5 w-5" />
                Track Disclosure
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-sans border-border/40"
                onClick={() => document.getElementById('disclosure-forms')?.scrollIntoView({ behavior: 'smooth' })}
              >
                New Disclosure
              </Button>
            </div>
          </div>
        </section>

        <WhoShouldUse />
        <div id="disclosure-forms">
          <SelfReportingForms />
        </div>
      </main>
      <Footer />
      <BackToTop />
      <TrackDisclosureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default SelfReporting;
