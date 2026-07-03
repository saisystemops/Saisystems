"use client";
import { brands } from "@/lib/data/brands";
import Image from "next/image";

export default function BrandsSection() {
  // Split brands into two lists for dual-direction marquee tracks
  const midIndex = Math.ceil(brands.length / 2);
  const track1 = brands.slice(0, midIndex);
  const track2 = brands.slice(midIndex);

  // Duplicate arrays to ensure seamless infinite looping scroll
  const duplicatedTrack1 = [...track1, ...track1, ...track1, ...track1];
  const duplicatedTrack2 = [...track2, ...track2, ...track2, ...track2];

  return (
    <section id="brands" className="py-20 bg-gray-50 dark:bg-gray-950 overflow-hidden relative border-t border-b border-gray-150 dark:border-gray-900">
      
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title & Tagline */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            Brands We Service &amp; Sell
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Universal Hardware <span className="text-gradient">Compatibility</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-semibold leading-relaxed">
            Our certified desk engineers possess chip-level expertise across all major computer, printer, and camera equipment brands.
          </p>
        </div>
      </div>

      {/* Marquee Outer Container with Gradient Masking Overlay on Left and Right Edges */}
      <div className="relative w-full z-10 flex flex-col gap-6 [mask-image:linear-gradient(to_right,transparent_0%,#000_15%,#000_85%,transparent_100%)]">
        
        {/* Track 1: Left to Right Scroll */}
        <div className="flex w-full overflow-hidden py-1">
          <div className="animate-marquee flex gap-5 hover:[animation-play-state:paused] cursor-pointer">
            {duplicatedTrack1.map((brand, idx) => (
              <div
                key={`${brand.id}-t1-${idx}`}
                className="w-40 h-20 flex-shrink-0 bg-white dark:bg-gray-900/40 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl flex items-center justify-center p-2.5 transition-all hover:border-orange-500/30 dark:hover:border-orange-500/20 hover:scale-105 shadow-sm"
                title={brand.description}
              >
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center p-2 relative">
                  <div className="relative w-full h-full grayscale hover:grayscale-0 contrast-125 transition-all duration-300">
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      fill
                      sizes="120px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Track 2: Right to Left Scroll */}
        <div className="flex w-full overflow-hidden py-1">
          <div className="animate-marquee-reverse flex gap-5 hover:[animation-play-state:paused] cursor-pointer">
            {duplicatedTrack2.map((brand, idx) => (
              <div
                key={`${brand.id}-t2-${idx}`}
                className="w-40 h-20 flex-shrink-0 bg-white dark:bg-gray-900/40 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl flex items-center justify-center p-2.5 transition-all hover:border-orange-500/30 dark:hover:border-orange-500/20 hover:scale-105 shadow-sm"
                title={brand.description}
              >
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center p-2 relative">
                  <div className="relative w-full h-full grayscale hover:grayscale-0 contrast-125 transition-all duration-300">
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      fill
                      sizes="120px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
