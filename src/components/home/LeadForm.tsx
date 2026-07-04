"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { services } from "@/lib/data/services";
import { brands } from "@/lib/data/brands";
import { Send, CheckCircle, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  serviceType: z.string().min(1, "Please select a service type"),
  brand: z.string().min(1, "Please select a brand"),
  problemDescription: z.string().min(10, "Please describe your problem in at least 10 characters"),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
        reset();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="get-quote" className="section-padding bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full mb-4">
              Free Quote
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get a{" "}
              <span className="text-gradient">Free Quote</span>
              <br />
              in Minutes
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Fill in the form and our team will reach out within 30 minutes with a diagnosis
              and transparent quote. No obligations, no hidden charges.
            </p>
            <div className="space-y-3">
              {[
                "I'd like to get a free diagnosis and consultation",
                "✅ Free diagnosis and consultation",
                "✅ Transparent pricing upfront",
                "✅ Same-day service available",
                "✅ 365-day warranty on all repairs",
                "✅ Genuine spare parts only",
              ].slice(1).map((item) => (
                <p key={item} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  {item}
                </p>
              ))}
            </div>
          </div>

          {/* Right form */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Quote Request Sent!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Our team will contact you within 30 minutes with a free diagnosis and quote.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Get Free Quote
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lead-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      {...register("name")}
                      id="lead-name"
                      placeholder="Your Full Name"
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="lead-mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      {...register("mobile")}
                      id="lead-mobile"
                      type="tel"
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="lead-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    id="lead-email"
                    type="email"
                    placeholder="your@email.com (optional)"
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lead-service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service Type *
                    </label>
                    <select
                      {...register("serviceType")}
                      id="lead-service"
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Service</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                    {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="lead-brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brand *
                    </label>
                    <select
                      {...register("brand")}
                      id="lead-brand"
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="lead-problem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Problem Description *
                  </label>
                  <textarea
                    {...register("problemDescription")}
                    id="lead-problem"
                    rows={3}
                    placeholder="Please describe your problem in detail..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  />
                  {errors.problemDescription && (
                    <p className="text-red-500 text-xs mt-1">{errors.problemDescription.message}</p>
                  )}
                </div>

                {/* Honeypot field to block bot spam */}
                <input
                  {...register("website")}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: "none" }}
                  className="hidden"
                />

                <button
                  type="submit"
                  id="lead-submit-btn"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 gradient-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-60"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={16} /> Get Free Quote</>
                  )}
                </button>

                <p className="text-xs text-center text-gray-400">
                  🔒 Your information is safe and will never be shared with third parties.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
