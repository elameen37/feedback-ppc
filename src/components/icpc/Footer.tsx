import { MapPin, Phone, Mail, Globe } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-primary text-primary-foreground relative overflow-hidden" aria-label="Site footer">
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
      <div className="container px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: ICPC info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/icpc-logo.jpeg"
                alt="ICPC Seal"
                className="h-12 w-12 rounded-full border-2 border-primary-foreground/20 object-cover"
              />
              <div>
                <p className="text-lg font-bold font-sans tracking-tight">ICPC Nigeria</p>
                <p className="text-xs opacity-60 font-sans">Empowering Transparency since 2000</p>
              </div>
            </div>
            <p className="text-sm opacity-80 font-sans leading-relaxed max-w-sm">
              The Independent Corrupt Practices and Other Related Offences Commission 
              is constitutionally mandated to receive and investigate complaints of corruption 
              and related offences.
            </p>
          </div>

          {/* Column 2: Contact */}
          <div>
            <h3 className="text-xs font-bold mb-6 font-sans uppercase tracking-[0.2em] text-accent">Contact Information</h3>
            <ul className="space-y-4 text-sm opacity-90 font-sans">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-accent/60" />
                <span className="leading-relaxed text-xs">Plot 802, Constitution Avenue, Zone A9, CBD, Abuja</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-accent/60" />
                <span className="text-xs">+234 (0) 9 290 3536</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-accent/60" />
                <span className="text-xs">info@icpc.gov.ng</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Links */}
          <div>
            <h3 className="text-xs font-bold mb-6 font-sans uppercase tracking-[0.2em] text-accent">Quick Links</h3>
            <ul className="space-y-3 text-xs opacity-80 font-sans">
              <li><a href="/" className="hover:text-accent transition-colors">Portal Home</a></li>
              <li><a href="/submit-feedback" className="hover:text-accent transition-colors">Submit Report</a></li>
              <li><a href="/self-reporting" className="hover:text-accent transition-colors">Disclosures</a></li>
              <li><a href="https://icpc.gov.ng" className="hover:text-accent transition-colors" target="_blank">Official Website</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Privacy & Security</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] opacity-60 font-sans text-center md:text-left">
            © {currentYear} Independent Corrupt Practices and Other Related Offences Commission.
          </p>
          <div className="flex gap-6">
            <p className="text-[10px] opacity-40 font-sans flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Secure Gateway Active
            </p>
            <p className="text-[10px] opacity-40 font-sans">
              Federal Republic of Nigeria
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
