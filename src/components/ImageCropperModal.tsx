"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

interface ImageCropperModalProps {
  imageSrc: string;
  aspect: number;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropperModal({ imageSrc, aspect, onClose, onCropComplete }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteInternal = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0B2B26] border border-[#C5A059]/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[700px]">
        <div className="p-4 border-b border-[#C5A059]/20 flex justify-between items-center bg-[#051815]">
          <h3 className="text-[#C5A059] font-serif font-bold text-lg">Crop Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="relative flex-1 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-5 bg-[#051815] border-t border-[#C5A059]/20 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#C5A059]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={isProcessing} className="flex-1 py-3 px-4 bg-[#0B2B26] border border-[#C5A059]/40 text-[#C5A059] rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#0A3A35] transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isProcessing} className="flex-1 py-3 px-4 bg-gradient-to-r from-[#996515] to-[#C5A059] text-[#0A1021] rounded-xl font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2">
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-[#0A1021]/30 border-t-[#0A1021] animate-spin"></span>
                  Processing...
                </>
              ) : "Crop & Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
