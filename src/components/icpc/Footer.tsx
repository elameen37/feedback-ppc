import { MapPin, Phone, Mail, Globe } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-black text-white py-12 border-t border-white/5 relative overflow-hidden" aria-label="Site footer">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="container px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Column 1: ICPC info */}
          <div className="group">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/icpc-logo.jpeg"
                alt="ICPC Seal"
                className="h-10 w-10 rounded-full border border-white/20 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div>
                <p className="text-sm font-bold font-sans tracking-wide">ICPC Nigeria</p>
                <p className="text-xs opacity-50 font-sans">Established by Act 2000</p>
              </div>
            </div>
            <p className="text-sm opacity-60 font-sans leading-relaxed">
              The Independent Corrupt Practices and Other Related Offences Commission
              is committed to ridding Nigeria of corruption through law enforcement,
              prevention, and public education.
            </p>
          </div>

          {/* Column 2: Contact */}
          <div>
            <h3 className="text-sm font-bold mb-6 font-sans uppercase tracking-[0.2em] text-white/90">Contact Information</h3>
            <ul className="space-y-4 text-sm opacity-70 font-sans">
              <li className="flex items-start gap-3 hover:text-white transition-colors duration-200">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Plot 802, Constitution Avenue, Zone A9, Central Business District, Abuja, Nigeria</span>
              </li>
              <li className="flex items-center gap-3 hover:text-white transition-colors duration-200">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>+234 (0) 9 290 3536</span>
              </li>
              <li className="flex items-center gap-3 hover:text-white transition-colors duration-200">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>info@icpc.gov.ng</span>
              </li>
              <li className="flex items-center gap-3 hover:text-white transition-colors duration-200">
                <Globe className="h-4 w-4 shrink-0 text-primary" />
                <a href="https://icpc.gov.ng" className="underline decoration-white/20 underline-offset-4" target="_blank" rel="noopener noreferrer">
                  icpc.gov.ng
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Links */}
          <div>
            <h3 className="text-sm font-bold mb-6 font-sans uppercase tracking-[0.2em] text-white/90">Quick Links</h3>
            <ul className="space-y-3 text-sm opacity-70 font-sans">
              <li><a href="/" className="hover:text-white hover:pl-1 transition-all">About</a></li>
              <li><a href="/submit-feedback" className="hover:text-white hover:pl-1 transition-all">Submit Feedback</a></li>
              <li><a href="/submit-feedback" className="hover:text-white hover:pl-1 transition-all">Track Complaint</a></li>
              <li><a href="/self-reporting" className="hover:text-white hover:pl-1 transition-all">Self-Reporting</a></li>
              <li><a href="https://icpc.gov.ng" className="hover:text-white hover:pl-1 transition-all" target="_blank" rel="noopener noreferrer">ICPC Act</a></li>
              <li><a href="https://icpc.gov.ng" className="hover:text-white hover:pl-1 transition-all" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><a href="https://icpc.gov.ng" className="hover:text-white hover:pl-1 transition-all" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-xs opacity-40 font-sans tracking-widest">
            © {currentYear} INDEPENDENT CORRUPT PRACTICES AND OTHER RELATED OFFENCES COMMISSION (ICPC). ALL RIGHTS RESERVED.
          </p>
          <p className="text-[10px] opacity-30 font-sans mt-2 tracking-[0.3em] uppercase">
            Federal Republic of Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
