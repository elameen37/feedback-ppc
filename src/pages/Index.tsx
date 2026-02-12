import Header from "@/components/icpc/Header";
import HeroSection from "@/components/icpc/HeroSection";
import FeedbackForms from "@/components/icpc/FeedbackForms";
import HowItWorks from "@/components/icpc/HowItWorks";
import TrustSecurity from "@/components/icpc/TrustSecurity";
import AdminDescription from "@/components/icpc/AdminDescription";
import Footer from "@/components/icpc/Footer";
import BackToTop from "@/components/icpc/BackToTop";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeedbackForms />
        <HowItWorks />
        <TrustSecurity />
        <AdminDescription />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
