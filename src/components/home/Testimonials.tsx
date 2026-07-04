"use client";
import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { Testimonial } from "@/lib/data/testimonials";

export default function Testimonials() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    service: "Laptop Repair",
    location: "Dindigul",
    role: "Customer",
    review: ""
  });

  useEffect(() => {
    let active = true;
    const fetchReviewsData = async () => {
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok && active) {
          const data = await res.json();
          setReviews(data || []);
        }
      } catch (err) {
        console.error("Failed to load testimonials:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchReviewsData();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        setSuccess(true);
        setNewReview({
          name: "",
          rating: 5,
          service: "Laptop Repair",
          location: "Dindigul",
          role: "Customer",
          review: ""
        });
        setRefreshTrigger((prev) => prev + 1);
        setTimeout(() => setSuccess(false), 5000);
        setShowForm(false);
      } else {
        alert("Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="section-padding bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            Customer Reviews
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-950 dark:text-white mb-4">
            What Our <span className="text-gradient">Customers Say</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-semibold">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="font-extrabold text-gray-900 dark:text-white">4.9/5</span>
              <span>based on customer ratings</span>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              ★ Write a Review
            </button>
          </div>
        </div>

        {/* Submission Success Banner */}
        {success && (
          <div className="max-w-xl mx-auto mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-pulse">
            🎉 Thank you! Your review has been saved and is now live on the wall!
          </div>
        )}

        {/* Review Submission Form Card */}
        {showForm && (
          <div className="max-w-xl mx-auto mb-12 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-xl transition-all duration-300">
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white mb-2 border-b border-gray-150 dark:border-gray-800 pb-2">Submit Your Experience</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anish Sharma"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Service Received</label>
                  <select
                    value={newReview.service}
                    onChange={(e) => setNewReview({ ...newReview, service: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="Laptop Repair">Laptop Repair</option>
                    <option value="Computer Repair">Computer Repair</option>
                    <option value="CCTV Installation">CCTV Installation</option>
                    <option value="Motherboard Servicing">Motherboard Servicing</option>
                    <option value="SSD & RAM Upgrade">SSD &amp; RAM Upgrade</option>
                    <option value="IT AMC Support">IT AMC Support</option>
                    <option value="Network Setup">Network Setup</option>
                    <option value="Accessories Purchase">Accessories Purchase</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Your Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Dindigul, Tamil Nadu"
                    value={newReview.location}
                    onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Star Rating</label>
                  <div className="flex gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={20}
                          className={`${
                            star <= (hoverRating || newReview.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Review Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details of your experience with Sai Systems..."
                  value={newReview.review}
                  onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-black rounded-xl hover:opacity-95"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Dynamic Reviews Listing wall */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            /* Skeleton Loading Grid */
            [1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl h-48 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-750 w-24 rounded" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-750 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-750 rounded w-5/6" />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-750" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-750 rounded w-16" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-750 rounded w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            reviews.slice(0, 6).map((t, idx) => (
              <div
                key={t.id || idx}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-150 dark:border-gray-750 hover:border-green-400 dark:hover:border-green-600 shadow-sm transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden"
              >
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 text-green-200/40 dark:text-green-950/30 w-8 h-8" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-3.5">
                  {Array.from({ length: Math.min(5, t.rating || 5) }).map((_, i) => (
                    <Star key={i} size={15} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Review Message */}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 min-h-[72px] line-clamp-4">
                  &ldquo;{t.review}&rdquo;
                </p>

                {/* Service Tag */}
                <span className="inline-block px-2.5 py-0.5 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-wider rounded-md mb-4 border border-green-200/30">
                  {t.service}
                </span>

                {/* Profile Card Header */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0">
                    {t.name ? t.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "CS"}
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 dark:text-white text-xs">{t.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{t.role || "Verified Client"} · {t.location}</p>
                  </div>
                  <span className="ml-auto text-[10px] text-gray-400 font-medium">{t.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
