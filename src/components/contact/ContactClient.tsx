"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/config";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Map, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    serviceType: "Laptop Repair",
    brand: "Dell",
    problemDescription: "",
    website: "", // honeypot
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Pincode coverage check states
  const [pincode, setPincode] = useState("");
  const [coverageChecked, setCoverageChecked] = useState(false);
  const [coverageAvailable, setCoverageAvailable] = useState(false);

  const servicesList = [
    "Laptop Repair",
    "Computer Repair",
    "Screen Repair",
    "Motherboard Repair",
    "SSD Upgrade",
    "Networking Services",
    "Virus Removal",
    "Data Recovery",
    "IT AMC Support",
    "Laptop & Computer Sales (New / Refurbished)",
    "Sell / Trade-in Old Device",
    "General Inquiry"
  ];

  const brandsList = [
    "Dell",
    "HP",
    "Lenovo",
    "Acer",
    "Asus",
    "Apple",
    "Samsung",
    "Compaq",
    "Foxin",
    "Other"
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long.";
    }
    if (!formData.mobile.match(/^[6-9]\d{9}$/)) {
      newErrors.mobile = "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).";
    }
    if (formData.email.trim() && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.problemDescription.trim() || formData.problemDescription.trim().length < 10) {
      newErrors.problemDescription = "Description must be at least 10 characters long.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          mobile: "",
          email: "",
          serviceType: "Laptop Repair",
          brand: "Dell",
          problemDescription: "",
          website: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const directMapUrl = `https://www.google.com/maps/place/10%C2%B021'48.1%22N+77%C2%B058'57.9%22E/@10.3634549,77.9826567,21z/data=!4m4!3m3!8m2!3d10.3633586!4d77.9827393?hl=en&entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=10.3633586,77.9827393&t=&z=18&ie=UTF8&iwloc=&output=embed`;

  // Animation variants for container & items
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section className="min-h-screen bg-[#fafafc] dark:bg-gray-950 py-16 sm:py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-500/10 dark:bg-orange-500/15 text-orange-650 dark:text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4 shadow-sm border border-orange-500/10 animate-pulse">
            💬 GET IN TOUCH
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-950 dark:text-white tracking-tight mb-4">
            Connect With <span className="text-gradient">Our Tech Experts</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Need doorstep laptop pickup, desktop support, custom pricing, or have a sales question? Write to us or reach out directly to experience premium service.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          
          {/* LEFT SIDE: Contact Channels & Map (Grid Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Call Expert */}
              <motion.div 
                variants={itemVariants}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md hover:border-orange-500/20 dark:hover:border-orange-500/20 transition-all duration-300 group"
              >
                <div>
                  <div className="w-12 h-12 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-950 dark:text-white mb-1 uppercase tracking-wider">Call Our Experts</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Available 10 AM - 7 PM</p>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800/80">
                  <a href={`tel:${siteConfig.phone}`} className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                    <span>{siteConfig.phone}</span>
                    <span className="text-[9px] bg-orange-500/10 px-1.5 py-0.5 rounded text-orange-600 dark:text-orange-400 font-extrabold uppercase">Primary</span>
                  </a>
                  <a href={`tel:${siteConfig.secondaryPhone}`} className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                    <span>{siteConfig.secondaryPhone}</span>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-extrabold uppercase">Backup</span>
                  </a>
                </div>
              </motion.div>

              {/* WhatsApp Chat */}
              <motion.a 
                variants={itemVariants}
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md hover:border-green-500/20 dark:hover:border-green-500/20 transition-all duration-300 group"
              >
                <div>
                  <div className="w-12 h-12 bg-[#25d366]/10 text-[#25d366] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-955 dark:text-white mb-1 uppercase tracking-wider">WhatsApp Chat</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Instant doorstep quotes</p>
                </div>
                <div className="pt-2 border-t border-slate-50 dark:border-slate-800/80">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-650 dark:text-green-450 hover:underline">
                    Message Us now →
                  </span>
                </div>
              </motion.a>

              {/* Email Support */}
              <motion.a 
                variants={itemVariants}
                href={`mailto:${siteConfig.email}`}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all duration-300 group"
              >
                <div>
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-955 dark:text-white mb-1 uppercase tracking-wider">Send an Email</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">For business inquiries</p>
                </div>
                <div className="pt-2 border-t border-slate-50 dark:border-slate-800/80 overflow-hidden">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate block">
                    {siteConfig.email}
                  </span>
                </div>
              </motion.a>

              {/* Business Hours */}
              <motion.div 
                variants={itemVariants}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md hover:border-purple-500/20 dark:hover:border-purple-500/20 transition-all duration-300 group"
              >
                <div>
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-600 dark:text-purple-455 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-955 dark:text-white mb-1 uppercase tracking-wider">Business Hours</h4>
                  <p className="text-xs text-gray-550 dark:text-gray-400 mb-3">Mon-Sat: 9 AM - 8 PM</p>
                </div>
                <div className="pt-2 border-t border-slate-50 dark:border-slate-800/80">
                  <span className="text-xs font-extrabold text-rose-600 dark:text-rose-450 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                    Sunday: Closed
                  </span>
                </div>
              </motion.div>

            </div>

            {/* Address Card */}
            <motion.div 
              variants={itemVariants}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 hover:border-orange-500/10 transition-colors duration-300"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-500/10 text-orange-650 dark:text-orange-400 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-extrabold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Showroom Address</h4>
                  <p className="text-xs sm:text-sm text-gray-650 dark:text-gray-300 leading-relaxed font-medium">
                    {siteConfig.address.street}, Dindigul, Tamil Nadu 624001
                  </p>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 pt-2 flex items-center gap-2">
                    <span>GSTIN:</span>
                    <span className="font-mono text-gray-800 dark:text-gray-300 font-extrabold bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700/30">{siteConfig.gstNumber}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between">
                <a
                  href={directMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-650 dark:text-orange-400 hover:underline"
                >
                  <Map className="w-3.5 h-3.5" />
                  Open in Google Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>

            {/* Checker Card */}
            <motion.div 
              variants={itemVariants}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Doorstep Service Checker</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Check if our fast home pickup and delivery technician service is active in your postal code.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (pincode.length === 6) {
                    setCoverageAvailable(pincode.startsWith("624"));
                    setCoverageChecked(true);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit Dindigul pincode"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-gray-950 dark:text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 text-white font-extrabold rounded-2xl text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Check
                </button>
              </form>

              {coverageChecked && (
                <div className={`p-4 rounded-2xl text-xs border font-bold flex items-start gap-2.5 transition-all ${
                  coverageAvailable 
                    ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                }`}>
                  <span className="text-base shrink-0">{coverageAvailable ? "✅" : "🏪"}</span>
                  <p className="leading-relaxed">
                    {coverageAvailable 
                      ? "Service Available! Free doorstep technician pickup is fully active in your area." 
                      : "Store Drop-In Only. Free doorstep service is unavailable in this zone, but you are welcome to visit our service desk!"
                    }
                  </p>
                </div>
              )}
            </motion.div>

            {/* Embedded Google Map Frame */}
            <motion.div 
              variants={itemVariants}
              className="h-72 rounded-3xl overflow-hidden border border-slate-150 dark:border-slate-800/80 shadow-inner relative group bg-slate-100 dark:bg-slate-900"
            >
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sai Systems Location Coordinates Map"
                className="absolute inset-0"
              />
              <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <a
                  href={directMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-gray-950/95 dark:bg-white/95 text-white dark:text-gray-955 text-[10px] font-bold rounded-xl flex items-center gap-1 shadow-lg hover:scale-105 transition-transform"
                >
                  <Map className="w-3 h-3" /> View Large Map
                </a>
              </div>
            </motion.div>

          </div>

          {/* RIGHT SIDE: Redesigned Premium Inquiry Form (Grid Span 7) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-7 bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-slate-800/80 shadow-xl shadow-slate-100 dark:shadow-none relative overflow-hidden"
          >
            {/* Subtle premium background glow */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10" />
            
            <div className="mb-8 border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <span className="inline-flex px-3 py-1 bg-orange-500/10 dark:bg-orange-500/20 text-orange-650 dark:text-orange-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-3">
                ✉️ INQUIRY DESK
              </span>
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">
                Send a Service Inquiry
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-medium">
                Fill out the details below. Our support coordinator will receive the ticket and contact you within 15 minutes to confirm pricing and scheduling.
              </p>
            </div>

            {/* Status alerts */}
            {submitStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 rounded-2xl flex items-start gap-3 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-orange-550" />
                <div>
                  <h5 className="font-extrabold text-sm">Form Submitted Successfully!</h5>
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed font-medium">
                    Your service ticket is created. A call coordinator is review it and will call you back on your mobile number in a few minutes.
                  </p>
                </div>
              </motion.div>
            )}

            {submitStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-455 rounded-2xl flex items-start gap-3 shadow-sm"
              >
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-rose-550" />
                <div>
                  <h5 className="font-extrabold text-sm">Failed to submit ticket</h5>
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed font-medium">
                    Something went wrong. Please check your internet connection or call our experts directly.
                  </p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              
              {/* Inputs Group: Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Full Name <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="E.g. John Doe"
                    className={`w-full px-4 py-3 bg-slate-50/50 dark:bg-gray-950 rounded-xl border ${
                      errors.name 
                        ? "border-rose-500 focus:ring-rose-500/20" 
                        : "border-slate-200 dark:border-slate-800/80 focus:border-orange-500 focus:ring-orange-500/20"
                    } text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all text-xs font-semibold`}
                  />
                  {errors.name && <p className="text-[10px] text-rose-550 font-bold mt-1">{errors.name}</p>}
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <label htmlFor="mobile" className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Mobile Number <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-xs text-gray-450 font-extrabold">+91</span>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="98765 43210"
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-gray-950 rounded-xl border ${
                        errors.mobile 
                          ? "border-rose-500 focus:ring-rose-500/20" 
                          : "border-slate-200 dark:border-slate-800/80 focus:border-orange-500 focus:ring-orange-500/20"
                      } text-gray-955 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all text-xs font-semibold`}
                    />
                  </div>
                  {errors.mobile && <p className="text-[10px] text-rose-550 font-bold mt-1">{errors.mobile}</p>}
                </div>
              </div>

              {/* Service & Brand Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Service Type */}
                <div className="space-y-2">
                  <label htmlFor="serviceType" className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Select Needed Service
                  </label>
                  <div className="relative">
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-gray-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-gray-950 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-xs font-bold appearance-none cursor-pointer"
                    >
                      {servicesList.map((service) => (
                        <option key={service} value={service} className="dark:bg-slate-900">
                          {service}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-400 dark:border-t-slate-650" />
                  </div>
                </div>

                {/* Device Brand */}
                <div className="space-y-2">
                  <label htmlFor="brand" className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Select Device Brand
                  </label>
                  <div className="relative">
                    <select
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50/50 dark:bg-gray-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-gray-950 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-xs font-bold appearance-none cursor-pointer"
                    >
                      {brandsList.map((brand) => (
                        <option key={brand} value={brand} className="dark:bg-slate-900">
                          {brand}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-400 dark:border-t-slate-650" />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Email Address <span className="text-gray-400 dark:text-gray-500 font-bold">(Optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="E.g. customer@example.com"
                  className={`w-full px-4 py-3 bg-slate-50/50 dark:bg-gray-950 rounded-xl border ${
                    errors.email 
                      ? "border-rose-500 focus:ring-rose-500/20" 
                      : "border-slate-200 dark:border-slate-800/80 focus:border-orange-500 focus:ring-orange-500/20"
                  } text-gray-955 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all text-xs font-semibold`}
                />
                {errors.email && <p className="text-[10px] text-rose-550 font-bold mt-1">{errors.email}</p>}
              </div>

              {/* Problem Description */}
              <div className="space-y-2">
                <label htmlFor="problemDescription" className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Describe the Issue / Request Details <span className="text-rose-500 font-extrabold">*</span>
                </label>
                <textarea
                  id="problemDescription"
                  name="problemDescription"
                  required
                  rows={4}
                  value={formData.problemDescription}
                  onChange={handleChange}
                  placeholder="Describe your device problem (e.g. keyboard keys not working, laptop showing blue screen, need wholesale laptop pricing list...)"
                  className={`w-full px-4 py-3 bg-slate-50/50 dark:bg-gray-950 rounded-xl border ${
                    errors.problemDescription 
                      ? "border-rose-500 focus:ring-rose-500/20" 
                      : "border-slate-200 dark:border-slate-800/80 focus:border-orange-500 focus:ring-orange-500/20"
                  } text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all text-xs leading-relaxed font-semibold`}
                />
                {errors.problemDescription && <p className="text-[10px] text-rose-550 font-bold mt-1">{errors.problemDescription}</p>}
              </div>

              {/* Honeypot field to block bot spam */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                style={{ display: "none" }}
                className="hidden"
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:shadow-orange-500/10 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Inquiry...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Inquiry Now
                  </>
                )}
              </button>

            </form>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
