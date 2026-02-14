import { useState } from "react";
import Header from "@/components/icpc/Header";
import Footer from "@/components/icpc/Footer";
import TrackComplaintSection from "@/components/icpc/TrackComplaint";
import TrackComplaintDialog from "@/components/icpc/TrackComplaintDialog";
import BackToTop from "@/components/icpc/BackToTop";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const TrackComplaintPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-12 sm:py-16">
          <div className="container px-4 sm:px-6 max-w-4xl text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Track Your Complaint
            </h1>
            <p className="text-sm sm:text-base opacity-90 font-sans max-w-2xl mx-auto mb-6">
              Enter your tracking reference ID below to view the current status of your complaint submission.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="font-sans gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <Search className="h-4 w-4" />
              Track Complaint
            </Button>
          </div>
        </section>
        <TrackComplaintSection />
      </main>
      <Footer />
      <BackToTop />
      <TrackComplaintDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default TrackComplaintPage;
