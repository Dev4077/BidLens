"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  textClassName?: string;
  badge?: string;
  badgeClassName?: string;
  href?: string;
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  xs: { box: "h-6 w-6", px: 24, rounded: "rounded-lg" },
  sm: { box: "h-8 w-8", px: 32, rounded: "rounded-xl" },
  md: { box: "h-9 w-9", px: 36, rounded: "rounded-xl" },
  lg: { box: "h-11 w-11", px: 44, rounded: "rounded-2xl" },
  xl: { box: "h-14 w-14", px: 56, rounded: "rounded-2xl" },
  "2xl": { box: "h-18 w-18", px: 72, rounded: "rounded-3xl" },
};

const textSizeMap = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
  "2xl": "text-3xl",
};

export function BrandLogo({
  size = "md",
  showText = true,
  textClassName,
  badge,
  badgeClassName,
  href,
  className,
  priority = false,
}: BrandLogoProps) {
  const currentSize = sizeMap[size] || sizeMap.md;
  const currentTextSize = textSizeMap[size] || textSizeMap.md;

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      {/* Glowing Neon Hexagon Bullseye Dart Icon */}
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-md shadow-cyan-500/10 transition-transform duration-300 group-hover:scale-105 group-hover:border-cyan-400/60 group-hover:shadow-cyan-500/25",
          currentSize.box,
          currentSize.rounded
        )}
      >
        <Image
          src="/logo.png"
          alt="BidLens Logo"
          width={currentSize.px}
          height={currentSize.px}
          priority={priority}
          className="object-cover w-full h-full transform scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
      </div>

      {/* Brand Name & Optional Badge */}
      {showText && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent transition-opacity",
              currentTextSize,
              textClassName
            )}
          >
            BidLens
          </span>
          {badge && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase border",
                badgeClassName || "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
              )}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export default BrandLogo;
