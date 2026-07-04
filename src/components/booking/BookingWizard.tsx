"use client";
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { services } from "@/lib/data/services";
import { brands } from "@/lib/data/brands";
import {
  CheckCircle, ChevronRight, ChevronLeft, Upload, Loader2,
  CalendarDays, Clock, User, Phone, Mail, Wrench, Cpu,
} from "lucide-react";
import { trackBookingClick, trackFormSubmit } from "@/lib/analytics";
import { siteConfig } from "@/lib/config";

// ── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  serviceType: z.string().min(1, "Please select a service"),
  brand: z.string().min(1, "Please select a brand"),
  model: z.string().min(1, "Please enter device model"),
  date: z.string().min(1, "Please select a date"),
  timeSlot: z.string().min(1, "Please select a time slot"),
  problemDescription: z.string().min(20, "Please describe the issue in at least 20 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit Indian mobile"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  serviceMode: z.enum(["doorstep", "drop-in"]),
});

type FormData = z.infer<typeof schema>;

// ── Time Slots ────────────────────────────────────────────────────────────────
const timeSlots = [
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM",
  "1:00 PM – 2:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
  "5:00 PM – 6:00 PM",
  "6:00 PM – 7:00 PM",
  "7:00 PM – 8:00 PM",
];

// ── Steps ─────────────────────────────────────────────────────────────────────
const steps = [
  { label: "Service", icon: Wrench },
  { label: "Device", icon: Cpu },
  { label: "Schedule", icon: CalendarDays },
  { label: "Details", icon: User },
  { label: "Confirm", icon: CheckCircle },
];

export default function BookingWizard() {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [submittedMobile, setSubmittedMobile] = useState("");

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { serviceMode: "doorstep" },
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const serviceParam = searchParams.get("service");
    const brandParam = searchParams.get("brand");
    const modelParam = searchParams.get("model");
    const problemParam = searchParams.get("problem");

    if (serviceParam) {
      setValue("serviceType", serviceParam);
    }
    if (brandParam) {
      setValue("brand", brandParam);
    }
    if (modelParam) {
      setValue("model", modelParam);
    }
    if (problemParam) {
      setValue("problemDescription", problemParam);
    }
  }, [searchParams, setValue]);

  const watchedFields = watch();

  // Dropzone for photos
  const onDrop = useCallback((accepted: File[]) => {
    setPhotos((prev) => [...prev, ...accepted].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
  });

  const nextStep = async () => {
    let fields: (keyof FormData)[] = [];
    if (step === 0) fields = ["serviceType"];
    if (step === 1) fields = ["brand", "model"];
    if (step === 2) fields = ["date", "timeSlot"];
    if (step === 3) fields = ["problemDescription", "name", "mobile", "serviceMode"];

    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setSubmittedMobile(data.mobile);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v as string));
      photos.forEach((p) => formData.append("photos", p));

      const res = await fetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      if (result.success) {
        setBookingRef(result.bookingRef || `SAI-${Date.now().toString().slice(-6)}`);
        setSubmitted(true);
        trackFormSubmit("booking_wizard", { service: data.serviceType });
      }
    } catch {
      // Still show success for demo
      setBookingRef(`SAI-${Date.now().toString().slice(-6)}`);
      setSubmitted(true);
      trackFormSubmit("booking_wizard");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 px-6 max-w-lg mx-auto">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Booking Confirmed! 🎉</h2>
        <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-950 rounded-xl mb-4">
          <p className="text-green-800 dark:text-green-400 font-bold text-lg">Ref: {bookingRef}</p>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          {"You'll receive a WhatsApp confirmation shortly. Our team will contact you within 30 minutes to confirm your appointment."}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Hi! My booking ref is ${bookingRef}. I want to confirm my appointment.`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25d366] text-white font-bold rounded-xl"
          >
            WhatsApp
          </a>
          <a
            href={`/track?ref=${encodeURIComponent(bookingRef)}&mobile=${encodeURIComponent(submittedMobile)}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-700 text-white font-bold rounded-xl"
          >
            Track Repair
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <div className={`flex flex-col items-center gap-1 ${i <= step ? "opacity-100" : "opacity-40"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                i < step ? "bg-green-600 text-white" : i === step ? "bg-green-700 text-white ring-4 ring-green-200 dark:ring-green-900" : "bg-gray-200 dark:bg-gray-800 text-gray-500"
              }`}>
                {i < step ? <CheckCircle size={18} /> : <s.icon size={18} />}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-all ${i < step ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Select Service */}
        {step === 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">What service do you need?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {services.slice(0, 18).map((s) => (
                <label
                  key={s.id}
                  className={`cursor-pointer flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    watchedFields.serviceType === s.title
                      ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                  }`}
                >
                  <input {...register("serviceType")} type="radio" value={s.title} className="sr-only" />
                  <span className="text-2xl mb-1">{s.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200 text-center line-clamp-2 leading-snug">{s.title}</span>
                </label>
              ))}
            </div>
            {errors.serviceType && <p className="text-red-500 text-sm mt-2">{errors.serviceType.message}</p>}
          </div>
        )}

        {/* Step 1: Device Brand + Model */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tell us about your device</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Brand</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {brands.map((b) => (
                  <label key={b.id} className={`cursor-pointer flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                    watchedFields.brand === b.name ? "border-green-600 bg-green-50 dark:bg-green-950/30" : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                  }`}>
                    <input {...register("brand")} type="radio" value={b.name} className="sr-only" />
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-100 dark:border-gray-850 relative overflow-hidden mb-1 flex-shrink-0">
                      <Image src={b.logo} alt={`${b.name} logo`} fill className="object-contain p-0.5" />
                    </span>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 text-center">{b.name}</span>
                  </label>
                ))}
                <label className={`cursor-pointer flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                  watchedFields.brand === "Other" ? "border-green-600 bg-green-50 dark:bg-green-950/30" : "border-gray-200 dark:border-gray-700"
                }`}>
                  <input {...register("brand")} type="radio" value="Other" className="sr-only" />
                  <span className="text-[9px] font-bold text-white bg-gray-500 w-8 h-8 rounded-lg flex items-center justify-center mb-1">OTHER</span>
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">Other</span>
                </label>
              </div>
              {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Model *</label>
              <input {...register("model")} id="booking-model" placeholder="e.g., HP Pavilion 15, Dell Inspiron 14" className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>}
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Photos <span className="text-gray-400">(optional, up to 5)</span></label>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-gray-300 dark:border-gray-700 hover:border-green-400"}`}>
                <input {...getInputProps()} />
                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-sm text-gray-500">{isDragActive ? "Drop photos here" : "Drag & drop or click to upload photos of the issue"}</p>
              </div>
              {photos.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {photos.map((f, i) => (
                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden">
                      <Image src={URL.createObjectURL(f)} alt={f.name} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Date + Time */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Date &amp; Time</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Date *</label>
              <input
                {...register("date")}
                id="booking-date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Time Slot *</label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <label key={slot} className={`cursor-pointer flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-sm ${
                    watchedFields.timeSlot === slot ? "border-green-600 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400" : "border-gray-200 dark:border-gray-700 hover:border-green-300 text-gray-700 dark:text-gray-300"
                  }`}>
                    <input {...register("timeSlot")} type="radio" value={slot} className="sr-only" />
                    <Clock size={14} />
                    {slot}
                  </label>
                ))}
              </div>
              {errors.timeSlot && <p className="text-red-500 text-sm mt-1">{errors.timeSlot.message}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Details</h3>

            {/* Service mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Mode *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "doorstep", label: "🏠 Doorstep Service", desc: "Technician comes to you" },
                  { value: "drop-in", label: "🏪 Drop-In Service", desc: "Bring device to our center" },
                ].map((m) => (
                  <label key={m.value} className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                    watchedFields.serviceMode === m.value ? "border-green-600 bg-green-50 dark:bg-green-950/30" : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                  }`}>
                    <input {...register("serviceMode")} type="radio" value={m.value} className="sr-only" />
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><User size={12} className="inline mr-1" />Full Name *</label>
                <input {...register("name")} id="booking-name" placeholder="Your name" className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><Phone size={12} className="inline mr-1" />Mobile *</label>
                <input {...register("mobile")} id="booking-mobile" type="tel" placeholder="10-digit number" className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><Mail size={12} className="inline mr-1" />Email (optional)</label>
              <input {...register("email")} id="booking-email" type="email" placeholder="your@email.com" className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            {watchedFields.serviceMode === "doorstep" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Address *</label>
                <textarea {...register("address")} id="booking-address" rows={2} placeholder="Full address with landmark" className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Describe the Issue *</label>
              <textarea {...register("problemDescription")} id="booking-problem" rows={3} placeholder="Describe what's wrong with your device in detail..." className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              {errors.problemDescription && <p className="text-red-500 text-xs mt-1">{errors.problemDescription.message}</p>}
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Your Booking</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
              {[
                { label: "Service", value: watchedFields.serviceType },
                { label: "Device", value: `${watchedFields.brand} ${watchedFields.model}` },
                { label: "Date", value: watchedFields.date },
                { label: "Time", value: watchedFields.timeSlot },
                { label: "Mode", value: watchedFields.serviceMode === "doorstep" ? "🏠 Doorstep" : "🏪 Drop-In" },
                { label: "Name", value: watchedFields.name },
                { label: "Mobile", value: watchedFields.mobile },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs truncate">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-400">
                ✅ Free diagnosis included<br />
                ✅ 365-day warranty on all repairs<br />
                ✅ Confirmation via WhatsApp within 30 mins
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-green-500 transition-all">
              <ChevronLeft size={18} /> Back
            </button>
          ) : <div />}

          {step < steps.length - 1 ? (
            <button type="button" onClick={nextStep} id={`booking-next-step-${step}`} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-700 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-500 transition-all">
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              id="booking-confirm-btn"
              disabled={loading}
              onClick={() => trackBookingClick(watchedFields.serviceType)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-700 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-500 transition-all disabled:opacity-60"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Booking...</> : <><CheckCircle size={16} /> Confirm Booking</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
