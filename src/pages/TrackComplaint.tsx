import Header from "@/components/icpc/Header";
import Footer from "@/components/icpc/Footer";
import TrackComplaintSection from "@/components/icpc/TrackComplaint";
import BackToTop from "@/components/icpc/BackToTop";

const TrackComplaintPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-12 sm:py-16">
          <div className="container px-4 sm:px-6 max-w-4xl text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Track Your Complaint
            </h1>
            <p className="text-sm sm:text-base opacity-90 font-sans max-w-2xl mx-auto">
              Enter your tracking reference ID below to view the current status of your complaint submission.
            </p>
          </div>
        </section>
        <TrackComplaintSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default TrackComplaintPage;
