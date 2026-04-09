import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "About", href: "/" },
  { label: "Submit Feedback", href: "/submit-feedback" },
  { label: "Self-Reporting", href: "/self-reporting" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY < lastScrollY.current || currentY < 10);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let auth: ReturnType<typeof useAuth> | null = null;
  try {
    auth = useAuth();
  } catch {
    // AuthProvider not mounted yet
  }

  const allLinks = [
    ...navLinks,
    ...(auth?.user && (auth.role === "admin" || auth.role === "officer")
      ? [{ label: "Dashboard", href: "/dashboard" }]
      : [{ label: "Officer Login", href: "/auth" }]),
  ];

  return (
    <header className={`sticky top-0 z-50 w-full bg-primary/95 backdrop-blur-md border-b border-white/5 shadow-2xl transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="text-primary-foreground">
        <div className="container flex items-center justify-between py-2.5">
          <div className="flex items-center gap-3 group">
            <a href="https://icpc.gov.ng/" target="_blank" rel="noopener noreferrer" className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src="/icpc-logo.jpeg" 
                alt="ICPC Official Seal" 
                className="h-10 w-10 rounded-full border border-primary-foreground/30 object-cover cursor-pointer relative z-10 grayscale hover:grayscale-0 transition-all duration-500" 
              />
            </a>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight tracking-wide font-sans text-white/90">
                Independent Corrupt Practices and
              </p>
              <p className="text-sm font-bold leading-tight tracking-wide font-sans text-white/90">
                Other Related Offences Commission
              </p>
            </div>
            <p className="block sm:hidden text-xs font-bold font-sans text-white/90">ICPC Nigeria</p>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <nav className="bg-white/5 border-t border-white/5" aria-label="Main navigation">
        <div className="container flex items-center overflow-hidden h-10">
          <ul className="hidden md:flex items-center h-full shrink-0">
            {allLinks.map(link => (
              <li key={link.href} className="h-full">
                <a href={link.href} className="flex items-center h-full px-4 text-xs lg:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all font-sans whitespace-nowrap relative group">
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-opacity" />
                </a>
              </li>
            ))}
          </ul>
          <div className="hidden md:block overflow-hidden ml-auto max-w-[35%] lg:max-w-[40%]">
            <div className="animate-marquee whitespace-nowrap text-xs lg:text-sm font-bold text-primary-foreground/90 tracking-widest uppercase">
              ✨ PROMOTING INTEGRITY AND TRANSPARENCY IN THE PUBLIC SERVICE &nbsp;|&nbsp; REPORT CORRUPTION SECURELY &nbsp;|&nbsp; ASSET DISCLOSURE PORTAL IS OPEN &nbsp;|&nbsp;
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden bg-white/5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap py-1.5 text-xs font-bold text-primary-foreground/80 tracking-widest uppercase px-4">
          ✨ PROMOTING INTEGRITY &nbsp;|&nbsp; REPORT CORRUPTION &nbsp;|&nbsp; ASSET DISCLOSURE IS OPEN &nbsp;|&nbsp;
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10" aria-label="Mobile navigation">
          <ul className="container py-4 space-y-2">
            {allLinks.map(link => (
              <li key={link.href}>
                <a href={link.href} className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg border border-transparent hover:border-white/20 transition-all font-sans" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
