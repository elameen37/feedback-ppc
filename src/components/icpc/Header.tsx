import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
const navLinks = [{
  label: "Home",
  href: "/"
}, {
  label: "Submit Feedback",
  href: "/#submit"
}, {
  label: "Self-Reporting",
  href: "/self-reporting"
}];
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <header className="sticky top-0 z-50 w-full bg-primary shadow-lg">
      {/* Unified top bar */}
      <div className="text-primary-foreground">
        <div className="container flex items-center justify-between py-2.5">
          <div className="flex items-center gap-3">
            <a href="https://icpc.gov.ng/" target="_blank" rel="noopener noreferrer">
              <img src="/icpc-logo.jpeg" alt="ICPC Official Seal" className="h-10 w-10 rounded-full border-2 border-primary-foreground/30 object-cover cursor-pointer" />
            </a>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight tracking-wide font-sans">
                Independent Corrupt Practices and
              </p>
              <p className="text-sm font-bold leading-tight tracking-wide font-sans">
                Other Related Offences Commission
              </p>
            </div>
            <p className="block sm:hidden text-xs font-bold font-sans">ICPC Nigeria</p>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-primary-foreground/10 backdrop-blur-sm" aria-label="Main navigation">
        <div className="container flex items-center overflow-hidden">
          <ul className="hidden md:flex items-center shrink-0">
            {navLinks.map(link => <li key={link.href}>
                <a href={link.href} className="block px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium text-primary-foreground hover:bg-primary-foreground/15 transition-colors font-sans whitespace-nowrap">
                  {link.label}
                </a>
              </li>)}
          </ul>
          <div className="hidden md:block overflow-hidden ml-auto max-w-[35%] lg:max-w-[40%]">
            <div className="animate-marquee whitespace-nowrap text-xs lg:text-sm font-medium text-accent">
              📢 Latest: ICPC launches new anti-corruption campaign nationwide &nbsp;|&nbsp; Public feedback portal now live — submit your complaints today &nbsp;|&nbsp; ICPC partners with civil society for transparency reforms &nbsp;|&nbsp;
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile marquee */}
      <div className="md:hidden bg-primary-foreground/5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap py-1.5 text-xs font-medium text-accent px-4">
          📢 Latest: ICPC launches new anti-corruption campaign nationwide &nbsp;|&nbsp; Public feedback portal now live &nbsp;|&nbsp; ICPC partners with civil society for transparency reforms &nbsp;|&nbsp;
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && <nav className="md:hidden bg-primary/95 backdrop-blur-sm border-t border-primary-foreground/10" aria-label="Mobile navigation">
          <ul className="container py-2 space-y-0.5">
            {navLinks.map(link => <li key={link.href}>
                <a href={link.href} className="block px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 rounded transition-colors font-sans" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              </li>)}
          </ul>
        </nav>}
    </header>;
};
export default Header;