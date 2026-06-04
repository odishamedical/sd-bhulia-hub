"use client";

import Image from "next/image";

import React, { useState, useRef, useEffect } from "react";

interface ImageUploaderProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  aspectRatio?: "square" | "portrait" | "landscape";
}

export default function ImageUploader({ 
  value, 
  onChange, 
  label = "Upload Image",
  aspectRatio = "square" 
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(!value.startsWith("data:"));

  // Adjustments (Crop / Zoom / Pan) State
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

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
      desc: "Recommended: 500 x 500 pixels",
      class: "aspect-square max-w-[240px]",
    },
    portrait: {
      label: "Tall Portrait (4:5 Ratio)",
      desc: "Recommended: 800 x 1000 pixels (for Product listings)",
      class: "aspect-[4/5] max-w-[220px]",
    },
    landscape: {
      label: "Widescreen / Landscape (16:9 or 5:2 Ratio)",
      desc: "Recommended: 1200 x 500 pixels (for Hero banners)",
      class: "aspect-[5/2] w-full",
    }
  }[aspectRatio];

  const handleProcessImage = (src: string) => {
    setRawImageSrc(src);
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const loadFileAndProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleProcessImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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
    const img = new Image();
    img.src = rawImageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let targetWidth = 500;
      let targetHeight = 500;

      if (aspectRatio === "portrait") {
        targetWidth = 480;
        targetHeight = 600;
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
    };
  };

  const clearImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-3 bg-[#0A3A35]/30 border border-[#C5A059]/25 rounded-2xl p-4">
      {/* Header Guideline */}
      <div className="flex justify-between items-start">
        <div>
          <label className="block text-xs font-bold text-[#C5A059] uppercase tracking-widest">{label}</label>
          <span className="block text-[9px] text-[#C5A059]/75 font-mono mt-0.5">{sizeGuidelines.label}</span>
          <span className="block text-[8px] text-gray-400 font-mono italic">{sizeGuidelines.desc}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[9px] text-[#C5A059]/80 hover:text-white uppercase tracking-wider underline cursor-pointer"
        >
          {showUrlInput ? "Use File Upload" : "Paste URL Instead"}
        </button>
      </div>

      {rawImageSrc ? (
        /* Image Adjustment Canvas Tool */
        <div className="bg-black/85 rounded-xl border border-[#C5A059]/40 p-4 space-y-4 flex flex-col items-center">
          <div className="text-center">
            <h4 className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider">Adjust Image Zoom & Align</h4>
            <p className="text-[8px] text-gray-400 mt-0.5">Use sliders below to adjust composition inside frame</p>
          </div>

          {/* Aspect Preview Frame Container */}
          <div className={`relative overflow-hidden rounded-xl border border-[#C5A059] bg-[#051815] w-full flex items-center justify-center ${sizeGuidelines.class}`}>
            <div className="absolute inset-0 z-10 border border-dashed border-white/20 pointer-events-none rounded-xl" />
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
          <div className="w-full space-y-3.5 text-gray-300 px-2">
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
                className="w-full h-1 bg-[#051815] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
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
                  className="w-full h-1 bg-[#051815] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
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
                  className="w-full h-1 bg-[#051815] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full pt-2">
            <button
              type="button"
              onClick={handleApplyCrop}
              className="flex-1 py-2 bg-gradient-to-r from-[#996515] to-[#C5A059] text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow hover:brightness-110"
            >
              Apply Crop & Preview
            </button>
            <button
              type="button"
              onClick={() => setRawImageSrc(null)}
              className="px-4 py-2 border border-[#C5A059]/50 text-gray-300 hover:text-white text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : showUrlInput ? (
        <div className="space-y-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            type="url"
            className="w-full bg-[#051815] border border-[#C5A059]/30 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#C5A059]"
            placeholder="https://example.com/photo.jpg"
          />
          {value && value.startsWith("http") && (
            <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-[#C5A059]/30 shadow">
              <img src={value} alt="Preview" className="object-cover w-full h-full" />
            </div>
          )}
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
                dragActive ? "border-[#C5A059] bg-[#0A3A35]/30" : "border-[#C5A059]/30 bg-[#051815]"
              }`}
            >
              <div className="text-2xl text-[#C5A059]/70">📁</div>
              <div className="text-xs text-gray-300">
                Drag & drop image here, or
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                <label className="bg-[#C5A059] text-[#0A1021] hover:brightness-110 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer select-none transition-all">
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
                  className="bg-[#0A3A35] border border-[#C5A059]/40 hover:border-[#C5A059] text-[#C5A059] hover:text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                >
                  📷 Take Photo
                </button>
              </div>
            </div>
          ) : null}

          {/* Active Camera View */}
          {cameraActive && (
            <div className="bg-black/90 rounded-2xl border border-[#C5A059]/40 p-4 relative overflow-hidden flex flex-col items-center justify-center gap-3">
              {cameraError ? (
                <div className="text-center p-6 space-y-3">
                  <p className="text-xs text-red-400 font-medium">{cameraError}</p>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 bg-[#0A3A35] text-white text-[10px] rounded uppercase font-bold tracking-wider"
                  >
                    Go Back
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative w-full aspect-square max-w-[280px] rounded-xl overflow-hidden border border-[#C5A059]/30">
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
                      className="px-5 py-2 bg-gradient-to-r from-[#996515] to-[#C5A059] text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow"
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 border border-[#C5A059]/50 text-gray-300 hover:text-white text-xs uppercase tracking-wider rounded-xl transition-all"
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
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-[#C5A059]/50 shadow-lg group">
              <img src={value} alt="Profile preview" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-black/75 hover:bg-red-600/90 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs transition-colors shadow cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
