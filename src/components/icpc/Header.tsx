import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Submit Feedback", href: "#submit" },
  { label: "Track Complaint", href: "#track" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <img
              src="/icpc-logo.jpeg"
              alt="ICPC Official Seal - Independent Corrupt Practices and Other Related Offences Commission"
              className="h-12 w-12 rounded-full border-2 border-secondary object-cover"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight tracking-wide font-sans">
                INDEPENDENT CORRUPT PRACTICES AND
              </p>
              <p className="text-sm font-bold leading-tight tracking-wide font-sans">
                OTHER RELATED OFFENCES COMMISSION
              </p>
            </div>
            <p className="block sm:hidden text-xs font-bold font-sans">ICPC Nigeria</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary/80 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Navigation bar */}
      <nav
        className="bg-primary/90 border-t border-primary-foreground/20"
        aria-label="Main navigation"
      >
        <div className="container">
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 transition-colors rounded font-sans"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="md:hidden bg-primary border-t border-primary-foreground/20"
          aria-label="Mobile navigation"
        >
          <ul className="container py-2 space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 rounded transition-colors font-sans"
                  onClick={() => setMobileOpen(false)}
                >
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
