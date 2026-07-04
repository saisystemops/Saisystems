import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Logo from "./Logo";

const footerLinks = {
  services: [
    { label: "Laptop Repair", href: "/services/laptop-repair-services" },
    { label: "Computer Repair", href: "/services/computer-repair-services" },
    { label: "Screen Repair", href: "/services/laptop-screen-repair" },
    { label: "Motherboard Repair", href: "/services/laptop-motherboard-repair" },
    { label: "Networking Services", href: "/services/lan-setup" },
    { label: "Antivirus Services", href: "/services/k7-antivirus" },
    { label: "Doorstep Service", href: "/services/laptop-doorstep-service" },
    { label: "All Services", href: "/services" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Book Service", href: "/book-service" },
    { label: "Products", href: "/products" },
    { label: "Brands", href: "/brands" },
    { label: "Cost Estimator", href: "/estimator" },
    { label: "Diagnostic Wizard", href: "/diagnose" },
    { label: "Track Repair Progress", href: "/track" },
    { label: "Service Coverage", href: "/coverage" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* CTA Banner */}
      <div className="gradient-primary py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Looking for Premium Refurbished Computers or CCTV Setup?
          </h2>
          <p className="text-orange-100 mb-6">
            Get the best deals on wholesale &amp; retail laptops, desktops, and CCTV setups. Free consultation!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/book-service"
              id="footer-book-btn"
              className="px-6 py-3 bg-white text-orange-900 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-lg"
            >
              📋 Book Service
            </Link>
            <a
              href={`tel:${siteConfig.phone}`}
              id="footer-call-btn"
              className="px-6 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-all border border-white/30"
            >
              📞 Call Now
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              id="footer-whatsapp-btn"
              className="px-6 py-3 bg-[#25d366] text-white font-bold rounded-xl hover:bg-[#20bd5a] transition-all shadow-lg"
            >
              💬 WhatsApp Now
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo className="w-10 h-10" textColorClass="text-white" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your trusted partner for all computer, laptop, networking, and IT support needs in India. Serving home users, businesses, schools, hospitals, and startups since {siteConfig.established}.
            </p>
            <div className="flex gap-3">
              {siteConfig.social.facebook && (
                <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer"
                  aria-label="Visit our Facebook page"
                  className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {siteConfig.social.instagram && (
                <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer"
                  aria-label="Visit our Instagram profile"
                  className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
              {siteConfig.social.linkedin && (
                <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer"
                  aria-label="Visit our LinkedIn profile"
                  className="w-9 h-9 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Our Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block text-sm text-gray-400 hover:text-orange-400 hover:translate-x-1 transition-all duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block text-sm text-gray-400 hover:text-orange-400 hover:translate-x-1 transition-all duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <a href={`tel:${siteConfig.phone}`} className="flex items-start gap-3 group">
                  <Phone size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-400 group-hover:text-orange-400 transition-colors">
                    {siteConfig.phone} (Primary)
                  </span>
                </a>
                <a href={`tel:${siteConfig.secondaryPhone}`} className="flex items-start gap-3 group pl-7">
                  <span className="text-sm text-gray-400 group-hover:text-orange-400 transition-colors">
                    {siteConfig.secondaryPhone} (Secondary)
                  </span>
                </a>
              </div>
              <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-3 group">
                <Mail size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400 group-hover:text-orange-400 transition-colors break-all">
                  {siteConfig.email}
                </span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">
                  {siteConfig.address.street}, {siteConfig.address.city},{" "}
                  {siteConfig.address.state} - {siteConfig.address.pincode}, India
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">{siteConfig.businessHours}</span>
              </div>
              <div className="pt-3 border-t border-gray-900">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-[11px] font-black text-orange-400 tracking-wide select-all shadow-inner shadow-orange-950/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  GSTIN: {siteConfig.gstNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Sai Systems. All rights reserved. | GSTIN: <span className="font-mono">{siteConfig.gstNumber}</span>
          </p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms & Conditions</Link>
            <Link href="/sitemap.xml" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
