import { useState } from "react";
import Header from "@/components/icpc/Header";
import Footer from "@/components/icpc/Footer";
import FeedbackForms from "@/components/icpc/FeedbackForms";
import HowItWorks from "@/components/icpc/HowItWorks";
import TrustSecurity from "@/components/icpc/TrustSecurity";
import TrackComplaintDialog from "@/components/icpc/TrackComplaintDialog";
import BackToTop from "@/components/icpc/BackToTop";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SubmitFeedbackPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />
      <main className="flex-1">
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
          <div className="container px-4 sm:px-6 max-w-4xl text-center animate-reveal">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 text-primary leading-tight">
              Report <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">Corruption</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-sans max-w-2xl mx-auto mb-8 leading-relaxed">
              Every legitimate report is a step toward national accountability. 
              Share your concerns securely and track their resolution in real time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="font-sans gap-2 glass-card hover:bg-secondary/80 transition-all"
                onClick={() => setDialogOpen(true)}
              >
                <Search className="h-5 w-5" />
                Track Complaint
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-sans border-border/40"
                onClick={() => document.getElementById('submit')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Submit New Report
              </Button>
            </div>
          </div>
        </section>

        <FeedbackForms />
      </main>
      <Footer />
      <BackToTop />
      <TrackComplaintDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default SubmitFeedbackPage;
