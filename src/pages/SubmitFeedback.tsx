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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="bg-black text-white py-12 sm:py-20 relative overflow-hidden border-b border-white/5">
          {/* Neon accent glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-primary/10 blur-[120px] pointer-events-none" />
          
          <div className="container px-4 sm:px-6 max-w-4xl text-center relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight animate-neon-glow uppercase">
              Submit Feedback & Complaints
            </h1>
            <p className="text-base sm:text-lg opacity-60 font-sans max-w-2xl mx-auto mb-10 leading-relaxed">
              Report corruption, respond to investigations, or share public interest concerns.
              All submissions are processed through our secure, encrypted infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="primary"
                className="font-bold font-sans gap-2 data-[state=active]:neon-glow transition-all px-8 py-6 rounded-xl hover:scale-105"
                onClick={() => setDialogOpen(true)}
              >
                <Search className="h-5 w-5" />
                Track My Complaint
              </Button>
            </div>
          </div>
        </section>
        <HowItWorks />
        <TrustSecurity />
        <FeedbackForms />
      </main>
      <Footer />
      <BackToTop />
      <TrackComplaintDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default SubmitFeedbackPage;
