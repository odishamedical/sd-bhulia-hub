"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface FullscreenImageViewerProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function FullscreenImageViewer({ images, initialIndex = 0, onClose }: FullscreenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Prevent scrolling when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center animate-fadeIn" onClick={onClose}>
      
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex gap-1.5 flex-1 max-w-[50%]">
          {images.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors duration-300 ${i === currentIndex ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors ml-4 backdrop-blur-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* Image Container (Mobile Portrait Enforced 9:16) */}
      <div className="relative w-full h-full sm:h-[90vh] sm:aspect-[9/16] max-w-2xl bg-black flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <Image 
          src={images[currentIndex]} 
          alt={`Product Image ${currentIndex + 1}`} 
          fill 
          className="object-contain sm:object-cover transition-opacity duration-500"
          priority
        />
        
        {/* Navigation Overlays */}
        {currentIndex > 0 && (
          <div className="absolute top-0 bottom-0 left-0 w-1/3 flex items-center justify-start p-4 cursor-pointer" onClick={handlePrev}>
            <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center shadow-lg border border-white/10 hover:bg-black/50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </div>
          </div>
        )}
        
        {currentIndex < images.length - 1 && (
          <div className="absolute top-0 bottom-0 right-0 w-1/3 flex items-center justify-end p-4 cursor-pointer" onClick={handleNext}>
            <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center shadow-lg border border-white/10 hover:bg-black/50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 inset-x-0 text-center z-10 font-mono text-[10px] uppercase tracking-widest text-white/50">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
