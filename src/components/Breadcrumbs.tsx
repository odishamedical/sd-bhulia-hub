"use client";
import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items, className = "" }: { items: BreadcrumbItem[], className?: string }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex items-center flex-wrap gap-2 text-xs md:text-sm font-sans font-semibold text-gray-400 w-full ${className}`}>
      <Link href="/" className="hover:text-white transition-colors">Home</Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="text-[#C5A059] opacity-60">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? "text-[#C5A059] font-bold" : "hover:text-white transition-colors cursor-pointer"}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
