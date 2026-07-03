import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textColorClass?: string;
  textSizeClass?: string;
  iconOnly?: boolean;
}

export default function Logo({
  className = "w-10 h-10",
  showText = true,
  textColorClass = "text-orange-600 dark:text-orange-500",
  textSizeClass = "text-lg",
  iconOnly = false,
}: LogoProps) {
  const logoImage = (
    <Image
      src="/logo-v3.png"
      alt="Sai Systems Logo"
      width={80}
      height={80}
      className={`${className} object-cover rounded-full group-hover:scale-105 transition-transform duration-300 shadow-sm`}
    />
  );

  if (iconOnly) {
    return logoImage;
  }

  return (
    <div className="flex items-center gap-2.5 group">
      {logoImage}
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span className="text-lg font-black uppercase tracking-wider text-orange-600 dark:text-orange-500 leading-none">
            SAI
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 leading-none mt-1">
            SYSTEMS
          </span>
        </div>
      )}
    </div>
  );
}
