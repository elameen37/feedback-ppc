import { useState } from "react";
import Header from "@/components/icpc/Header";
import Footer from "@/components/icpc/Footer";
import BackToTop from "@/components/icpc/BackToTop";
import WhoShouldUse from "@/components/icpc/self-reporting/WhoShouldUse";
import SelfReportingForms from "@/components/icpc/self-reporting/SelfReportingForms";
import SelfReportingTracker from "@/components/icpc/self-reporting/SelfReportingTracker";
import TrackDisclosureDialog from "@/components/icpc/self-reporting/TrackDisclosureDialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SelfReporting = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-12 sm:py-16">
          <div className="container px-4 sm:px-6 max-w-4xl text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              ICPC Self-Reporting & Voluntary Disclosure Portal
            </h1>
            <p className="text-sm sm:text-base opacity-90 font-sans max-w-2xl mx-auto mb-6">
              A secure platform for voluntary disclosure, cooperation, and corrective compliance.
              Your courage to come forward strengthens our nation's fight against corruption.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="font-sans gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <Search className="h-4 w-4" />
              Track Disclosure
            </Button>
          </div>
        </section>

        <WhoShouldUse />
        <SelfReportingForms />
        <SelfReportingTracker />
      </main>
      <Footer />
      <BackToTop />
      <TrackDisclosureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default SelfReporting;
