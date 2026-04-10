import Header from "@/components/icpc/Header";
import HeroSection from "@/components/icpc/HeroSection";
import AboutSection from "@/components/icpc/AboutSection";
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
        <AboutSection />
        <HowItWorks />
        <TrustSecurity />
        <AdminDescription />
      </main>
      <Footer />
      <BackToTop />
      <div className="fixed bottom-2 right-2 text-[10px] text-muted-foreground/30 pointer-events-none select-none">
        System: Active
      </div>
    </div>
  );
};

export default Index;
