"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/config";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2, AlertCircle, Laptop } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    serviceType: "Laptop Repair",
    brand: "Dell",
    problemDescription: "",
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

  const mapQueryAddress = encodeURIComponent(
    `${siteConfig.address.street}, Umayal Complex, Dindigul Bazaar, Vivekananda Nagar, Dindigul, Tamil Nadu 624001`
  );
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQueryAddress}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Contact Information Cards & Map (Grid Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="text-left">
            <span className="text-xs uppercase tracking-widest text-orange-500 dark:text-orange-400 font-bold">
              📍 Our Location
            </span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1 mb-4">
              Get in Touch Directly
            </h2>
          </div>

          {/* Interactive Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div
              className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Call Our Experts</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Available 9 AM - 7 PM</p>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                >
                  <span>{siteConfig.phone}</span>
                  <span className="text-[10px] bg-orange-500/10 px-1.5 py-0.5 rounded text-orange-600 dark:text-orange-400 font-bold uppercase">Primary</span>
                </a>
                <a
                  href={`tel:${siteConfig.secondaryPhone}`}
                  className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                >
                  <span>{siteConfig.secondaryPhone}</span>
                  <span className="text-[10px] bg-gray-500/10 dark:bg-gray-800/50 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400 font-bold uppercase">Secondary</span>
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 bg-gray-50 hover:bg-orange-50/50 dark:bg-gray-900 dark:hover:bg-orange-950/10 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-[#25d366]/10 text-[#25d366] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">WhatsApp Chat</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Instant doorstep quotes</p>
              </div>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 group-hover:underline mt-2">
                Message Us →
              </span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${siteConfig.email}`}
              className="group p-5 bg-gray-50 hover:bg-orange-50/50 dark:bg-gray-900 dark:hover:bg-orange-950/10 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Send an Email</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">For business inquiries</p>
              </div>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 group-hover:underline mt-2 break-all">
                {siteConfig.email}
              </span>
            </a>

            {/* Business Hours */}
            <div
              className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Business Hours</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Mon-Sat: 9 AM - 7 PM</p>
              </div>
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-450 mt-2">
                Sunday: 10 AM - 5 PM
              </span>
            </div>
          </div>

          {/* Full-width Address Card */}
          <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex gap-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Store Address &amp; Credentials</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {siteConfig.address.street}, Umayal Complex, Dindigul Bazaar, Behind Eswari Stores, Vivekananda Nagar, Dindigul, Tamil Nadu 624001
              </p>
              <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-150 dark:border-gray-800 flex items-center gap-1">
                <span>GSTIN Reg:</span>
                <span className="font-mono text-gray-800 dark:text-gray-300 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{siteConfig.gstNumber}</span>
              </div>
              <a
                href={`https://maps.google.com/?q=${mapQueryAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline mt-2 inline-block"
              >
                Get Directions on Map →
              </a>
            </div>
          </div>

          {/* Pincode Availability Checker Widget */}
          <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
              <span>📍 Doorstep Service Checker</span>
            </h4>
            <p className="text-xs text-gray-500">
              Check if doorstep technician service is active in your area code.
            </p>
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
                placeholder="Enter 6-digit pincode"
                className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-750 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Check
              </button>
            </form>
            {coverageChecked && (
              <div className={`p-3 rounded-xl text-xs border font-semibold ${
                coverageAvailable 
                  ? "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400" 
                  : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
              }`}>
                {coverageAvailable 
                  ? "✅ Service Available! Free doorstep pickup is active in your area." 
                  : "🏪 Store Drop-In Only. Doorstep pickup is out of bounds, but you are welcome to visit our center!"
                }
              </div>
            )}
          </div>

          {/* Real Embedded Google Map */}
          <div className="h-64 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner relative">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sai Systems Location Map"
              className="absolute inset-0"
            />
          </div>
        </div>

        {/* Right Side: Contact / Lead Form (Grid Span 7) */}
        <div className="lg:col-span-7 bg-gray-50 dark:bg-gray-900/80 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden">
          {/* Subtle decorative background glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 mb-8">
            <span className="text-xs uppercase tracking-widest text-orange-500 dark:text-orange-400 font-bold">
              ✉️ Message Box
            </span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
              Send a Service Inquiry
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Fill out this form and our technical support coordinator will call you back within 15 minutes to discuss pricing, repairs, or setup quotes.
            </p>
          </div>

          {/* Form Actions status alerts */}
          {submitStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 rounded-2xl flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-orange-500" />
              <div>
                <h5 className="font-bold">Inquiry Sent Successfully!</h5>
                <p className="text-xs opacity-90 mt-0.5">
                  Thank you! We have received your request. An expert technician will get in touch with you shortly.
                </p>
              </div>
            </motion.div>
          )}

          {submitStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h5 className="font-bold">Something went wrong</h5>
                <p className="text-xs opacity-90 mt-0.5">
                  Failed to send your inquiry. Please try again or call us directly.
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-950 rounded-xl border ${
                    errors.name ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                  } text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobile" className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-sm text-gray-450 font-medium">+91</span>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="98765 43210"
                    className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-950 rounded-xl border ${
                      errors.mobile ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                    } text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm`}
                  />
                </div>
                {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Service Type */}
              <div>
                <label htmlFor="serviceType" className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">
                  Required Service
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  {servicesList.map((service) => (
                    <option key={service} value={service} className="dark:bg-gray-950">
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Device Brand */}
              <div>
                <label htmlFor="brand" className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">
                  Device Brand
                </label>
                <select
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  {brandsList.map((brand) => (
                    <option key={brand} value={brand} className="dark:bg-gray-950">
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">
                Email Address <span className="text-gray-450">(Optional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full px-4 py-3 bg-white dark:bg-gray-950 rounded-xl border ${
                  errors.email ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                } text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Problem Description */}
            <div>
              <label htmlFor="problemDescription" className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">
                Describe the issue / details <span className="text-red-500">*</span>
              </label>
              <textarea
                id="problemDescription"
                name="problemDescription"
                required
                rows={4}
                value={formData.problemDescription}
                onChange={handleChange}
                placeholder="E.g. My laptop is overheating and shut downs automatically during use. Need SSD upgrade suggestions."
                className={`w-full px-4 py-3 bg-white dark:bg-gray-950 rounded-xl border ${
                  errors.problemDescription ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                } text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm leading-relaxed`}
              />
              {errors.problemDescription && <p className="text-xs text-red-500 mt-1">{errors.problemDescription}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Inquiry...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Inquiry Now
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
