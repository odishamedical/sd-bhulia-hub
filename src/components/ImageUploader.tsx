"use client";

import Image from "next/image";

import React, { useState, useRef, useEffect } from "react";

interface ImageUploaderProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  aspectRatio?: "square" | "portrait" | "landscape";
  captionValue?: string;
  onCaptionChange?: (val: string) => void;
}

export default function ImageUploader({ 
  value, 
  onChange, 
  label = "Upload Image",
  aspectRatio = "square",
  captionValue,
  onCaptionChange
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Adjustments (Crop / Zoom / Pan) State
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Format guidelines text
  const sizeGuidelines = {
    square: {
      label: "Portrait / Square Profile (1:1 Ratio)",
      desc: "Recommended: 500 x 500 pixels. Max 20MB.",
      class: "aspect-square max-w-[240px]",
    },
    portrait: {
      label: "Tall Portrait (9:16 Ratio)",
      desc: "Recommended: 900 x 1600 pixels (for Product listings). Max 20MB.",
      class: "aspect-[9/16] max-w-[220px]",
    },
    landscape: {
      label: "Widescreen / Landscape (16:9 or 5:2 Ratio)",
      desc: "Recommended: 1200 x 500 pixels (for Hero banners). Max 20MB.",
      class: "aspect-[5/2] w-full",
    }
  }[aspectRatio];

  const handleProcessImage = async (src: string) => {
    // Generate the base64 crop FIRST before showing the UI
    const autoCropBase64 = await new Promise<string>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let targetWidth = 500;
          let targetHeight = 500;

          if (aspectRatio === "portrait") {
            targetWidth = 540;
            targetHeight = 960;
          } else if (aspectRatio === "landscape") {
            targetWidth = 1000;
            targetHeight = 400;
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#051815";
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            let drawWidth = targetWidth;
            let drawHeight = targetHeight;
            const imgRatio = img.width / img.height;
            const targetRatio = targetWidth / targetHeight;

            if (imgRatio > targetRatio) {
              drawWidth = targetHeight * imgRatio;
            } else {
              drawHeight = targetWidth / imgRatio;
            }

            const x = (targetWidth - drawWidth) / 2;
            const y = (targetHeight - drawHeight) / 2;

            ctx.drawImage(img, x, y, drawWidth, drawHeight);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          } else {
            reject("No context");
          }
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = src;
    }).catch((e) => {
      console.error("Auto-crop failed:", e);
      return src; // Fallback
    });

    // Now safely update the state!
    onChange(autoCropBase64);
    
    setRawImageSrc(src);
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setIsProcessing(false);
  };

  const loadFileAndProcess = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      alert("File is too large. Please upload an image under 20MB.");
      return;
    }
    
    setIsProcessing(true);
    try {
      const blobUrl = URL.createObjectURL(file);
      handleProcessImage(blobUrl);
    } catch (e) {
      console.error("Failed to load file:", e);
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFileAndProcess(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadFileAndProcess(e.dataTransfer.files[0]);
    }
  };

  // Camera capture controls
  const startCamera = async () => {
    setCameraActive(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera stream error: ", err);
      setCameraError("Camera permission denied or camera device not found.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraError(null);
  };

  const snapPhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        handleProcessImage(dataUrl);
      }
      stopCamera();
    }
  };

  const handleApplyCrop = () => {
    if (!rawImageSrc) return;
    const img = new window.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let targetWidth = 500;
        let targetHeight = 500;

        if (aspectRatio === "portrait") {
          targetWidth = 540;
          targetHeight = 960;
        } else if (aspectRatio === "landscape") {
          targetWidth = 1000;
          targetHeight = 400; // 5:2 ratio
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Render background color
          ctx.fillStyle = "#051815";
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          let drawWidth = targetWidth;
          let drawHeight = targetHeight;
          const imgRatio = img.width / img.height;
          const targetRatio = targetWidth / targetHeight;

          if (imgRatio > targetRatio) {
            drawWidth = targetHeight * imgRatio;
          } else {
            drawHeight = targetWidth / imgRatio;
          }

          drawWidth *= scale;
          drawHeight *= scale;

          const x = (targetWidth - drawWidth) / 2 + offsetX;
          const y = (targetHeight - drawHeight) / 2 + offsetY;

          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          onChange(compressedBase64);
        } else {
          onChange(rawImageSrc);
        }
        setRawImageSrc(null);
      } catch (e) {
        console.error("Apply crop failed:", e);
      }
    };
    img.onerror = () => {
      console.error("Image load failed during apply crop");
    };
    img.src = rawImageSrc;
  };

  const clearImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-3 bg-blue-50/50 border border-blue-200 rounded-2xl p-4 relative">
      {/* Header Guideline */}
      <div className="flex justify-between items-start mb-2">
        <div className="w-full">
          <label className="block text-sm sm:text-base font-black text-blue-900 uppercase tracking-widest">{label}</label>
          <span className="block text-xs sm:text-sm text-blue-700 font-bold mt-1">{sizeGuidelines.label}</span>
          <span className="block text-[11px] sm:text-xs text-gray-600 font-mono font-medium mt-1">{sizeGuidelines.desc}</span>
        </div>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-2xl border border-blue-200">
          <div className="text-center space-y-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs font-bold text-blue-900">Processing Image...</div>
          </div>
        </div>
      )}

      {rawImageSrc ? (
        /* Image Adjustment Canvas Tool */
        <div className="bg-white shadow-md rounded-xl border border-gray-200 p-4 space-y-4 flex flex-col items-center">
          <div className="text-center">
            <h4 className="text-[10px] uppercase font-bold text-blue-900 tracking-wider">Adjust Image Zoom & Align</h4>
            <p className="text-[8px] text-gray-500 mt-0.5">Use sliders below to adjust composition inside frame</p>
          </div>

          {/* Aspect Preview Frame Container */}
          <div className={`relative overflow-hidden rounded-xl border border-blue-300 bg-gray-50 w-full flex items-center justify-center ${sizeGuidelines.class}`}>
            <div className="absolute inset-0 z-10 border border-dashed border-gray-300 pointer-events-none rounded-xl" />
            <img 
              src={rawImageSrc} 
              alt="Adjustment Source"
              style={{
                transform: `scale(${scale}) translate(${offsetX / scale}px, ${offsetY / scale}px)`,
                transition: "transform 0.05s ease-out"
              }}
              className="object-contain max-h-[300px] pointer-events-none"
            />
          </div>

          {/* Sliders Container */}
          <div className="w-full space-y-3.5 text-gray-600 px-2">
            <div>
              <div className="flex justify-between text-[10px] font-mono">
                <span>🔍 Zoom ({scale.toFixed(1)}x)</span>
                <span>Max: 3.0x</span>
              </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="0.05"
                  value={scale}
                  onChange={e => setScale(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span>↔ Pan X ({offsetX}px)</span>
                </div>
                  <input 
                    type="range" 
                    min="-200" 
                    max="200"
                    value={offsetX}
                    onChange={e => setOffsetX(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span>↕ Pan Y ({offsetY}px)</span>
                </div>
                  <input 
                    type="range" 
                    min="-200" 
                    max="200"
                    value={offsetY}
                    onChange={e => setOffsetY(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full pt-2">
            <button
              type="button"
              onClick={handleApplyCrop}
              className="flex-1 py-2 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow hover:bg-blue-700"
            >
              Apply Crop & Preview
            </button>
            <button
              type="button"
              onClick={() => setRawImageSrc(null)}
              className="px-4 py-2 border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Main Uploader Box */}
          {!value && !cameraActive ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive ? "border-blue-400 bg-blue-50/50" : "border-blue-200 bg-white"
              }`}
            >
              <div className="text-2xl text-blue-500">📁</div>
              <div className="text-xs text-gray-500">
                Drag & drop image here, or
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                <label className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer select-none transition-all">
                  Browse Files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-white border border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-800 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                >
                  📷 Take Photo
                </button>
              </div>
            </div>
          ) : null}

          {/* Active Camera View */}
          {cameraActive && (
            <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 relative overflow-hidden flex flex-col items-center justify-center gap-3">
              {cameraError ? (
                <div className="text-center p-6 space-y-3">
                  <p className="text-xs text-red-400 font-medium">{cameraError}</p>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 text-[10px] rounded uppercase font-bold tracking-wider"
                  >
                    Go Back
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative w-full aspect-square max-w-[280px] rounded-xl overflow-hidden border border-gray-300">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-4 border border-white/20 rounded-full pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-px bg-white/30" />
                      <div className="h-8 w-px bg-white/30" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={snapPhoto}
                      className="px-5 py-2 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow hover:bg-blue-700"
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Image Uploaded Preview */}
          {value && !cameraActive && (
            <div className="flex flex-col gap-2">
              <div className={`relative rounded-2xl overflow-hidden border border-gray-300 shadow-sm group ${
                aspectRatio === "portrait" ? "w-32 aspect-[9/16]" : 
                aspectRatio === "landscape" ? "w-64 aspect-[5/2]" : 
                "w-32 h-32"
              }`}>
                <img 
                  src={value} 
                  alt="Profile preview" 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/bhulia-hero.png";
                  }}
                />
                <a
                  href={value}
                  download="bhulia-original-photo.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/75 hover:bg-blue-600/90 text-white px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap cursor-pointer shadow z-10"
                >
                  ⬇ Download
                </a>
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-black/75 hover:bg-red-600/90 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs transition-colors shadow cursor-pointer z-10"
                >
                  ✕
                </button>
              </div>
              
              {onCaptionChange && (
                <div className="w-full max-w-[220px]">
                  <input
                    type="text"
                    placeholder="Alt text / Description (SEO)"
                    value={captionValue || ""}
                    onChange={(e) => onCaptionChange(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-200 text-blue-900 rounded-lg px-3 py-2 text-xs placeholder:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
