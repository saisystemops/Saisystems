"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { Menu, X, Phone, Sun, Moon, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Laptop Repair", href: "/services/laptop-repair-services" },
      { label: "Computer Repair", href: "/services/computer-repair-services" },
      { label: "Screen Repair", href: "/services/laptop-screen-repair" },
      { label: "Motherboard Repair", href: "/services/laptop-motherboard-repair" },
      { label: "SSD Upgrade", href: "/services/ssd-upgrade" },
      { label: "Networking", href: "/services/computer-networking-services" },
      { label: "Virus Removal", href: "/services/virus-removal" },
      { label: "Data Recovery", href: "/services/data-recovery" },
      { label: "IT AMC Support", href: "/services/it-amc-support" },
      { label: "All Services →", href: "/services" },
    ],
  },
  {
    label: "Tools",
    href: "/estimator",
    children: [
      { label: "Cost Estimator", href: "/estimator" },
      { label: "Diagnostic Wizard", href: "/diagnose" },
      { label: "Track Repair Progress", href: "/track" },
      { label: "Service Coverage", href: "/coverage" },
    ],
  },
  { label: "Products", href: "/products" },
  { label: "Brands", href: "/brands" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];


export default function Header() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isSolid = scrolled || !isHome;

  const linkClass = isSolid
    ? "text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40"
    : "text-gray-800 dark:text-white/90 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10";

  const iconClass = isSolid
    ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    : "text-gray-800 dark:text-white/80 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10";

  const handleMouseEnter = (label: string) => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      setLeaveTimeout(null);
    }
    setDropdown(label);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setDropdown(null);
    }, 150);
    setLeaveTimeout(timeout);
  };

  const handleOptionClick = () => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      setLeaveTimeout(null);
    }
    setDropdown(null);
  };

  useEffect(() => {
    return () => {
      if (leaveTimeout) clearTimeout(leaveTimeout);
    };
  }, [leaveTimeout]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
    setTimeout(() => {
      setDark(isDark);
    }, 0);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid
          ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-lg border-b border-orange-100 dark:border-orange-950"
          : "bg-transparent"
      }`}
    >
      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <Logo 
            className="w-10 h-10" 
            textColorClass={isSolid ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-white"}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(link.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link 
                  href={link.href}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${linkClass}`}
                >
                  {link.label}
                  <ChevronDown size={14} className={`transition-transform ${dropdown === link.label ? "rotate-180" : ""}`} />
                </Link>
                <AnimatePresence>
                  {dropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 pt-2 w-56 z-50"
                    >
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            onClick={handleOptionClick}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${linkClass}`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            id="theme-toggle"
            className={`p-2 rounded-lg transition-all ${iconClass}`}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            href={`tel:${siteConfig.phone}`}
            id="header-call-btn"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Phone size={14} />
            Call Now
          </a>
          <Link
            href="/book-service"
            id="header-book-btn"
            className="hidden md:flex items-center gap-1.5 px-4 py-2 gradient-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-md"
          >
            Book Service
          </Link>
          <button
            id="mobile-menu-btn"
            className={`lg:hidden p-2 rounded-lg transition-all ${iconClass}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shadow-xl max-h-screen overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 rounded-lg transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="ml-4 space-y-1 mt-1">
                    {(link.label === "Services" ? link.children.slice(0, -1) : link.children).map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        → {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 pb-2 grid grid-cols-2 gap-2">
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-lg"
              >
                <Phone size={14} /> Call Now
              </a>
              <Link
                href="/book-service"
                className="flex items-center justify-center px-3 py-2.5 gradient-primary text-white text-sm font-semibold rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Book Service
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
