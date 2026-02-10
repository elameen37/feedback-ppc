import { MapPin, Phone, Mail, Globe } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-primary text-primary-foreground" aria-label="Site footer">
      <div className="container px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Column 1: ICPC info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/icpc-logo.jpeg"
                alt="ICPC Seal"
                className="h-10 w-10 rounded-full border border-secondary object-cover"
              />
              <div>
                <p className="text-sm font-bold font-sans">ICPC Nigeria</p>
                <p className="text-xs opacity-80 font-sans">Established by Act 2000</p>
              </div>
            </div>
            <p className="text-sm opacity-80 font-sans leading-relaxed">
              The Independent Corrupt Practices and Other Related Offences Commission
              is committed to ridding Nigeria of corruption through law enforcement,
              prevention, and public education.
            </p>
          </div>

          {/* Column 2: Contact */}
          <div>
            <h3 className="text-sm font-bold mb-4 font-sans uppercase tracking-wider">Contact Information</h3>
            <ul className="space-y-3 text-sm opacity-90 font-sans">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Plot 802, Constitution Avenue, Zone A9, Central Business District, Abuja, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+234 (0) 9 290 3536</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@icpc.gov.ng</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0" />
                <a href="https://icpc.gov.ng" className="underline hover:opacity-100" target="_blank" rel="noopener noreferrer">
                  icpc.gov.ng
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Links */}
          <div>
            <h3 className="text-sm font-bold mb-4 font-sans uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm opacity-90 font-sans">
              <li><a href="#home" className="hover:underline">Home</a></li>
              <li><a href="#submit" className="hover:underline">Submit Feedback</a></li>
              <li><a href="#track" className="hover:underline">Track Complaint</a></li>
              <li><a href="https://icpc.gov.ng" className="hover:underline" target="_blank" rel="noopener noreferrer">ICPC Act</a></li>
              <li><a href="https://icpc.gov.ng" className="hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><a href="https://icpc.gov.ng" className="hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/20 text-center">
          <p className="text-xs opacity-70 font-sans">
            © {currentYear} Independent Corrupt Practices and Other Related Offences Commission (ICPC). All rights reserved.
          </p>
          <p className="text-xs opacity-50 font-sans mt-1">
            Federal Republic of Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
