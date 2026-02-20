"use client";

import { Image as ImageIcon } from "lucide-react";

export default function AdminMedia() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight">
          Media Library
        </h1>
        <p className="text-[13px] text-[#b0ada8] mt-0.5">
          Manage covers, audio files, and assets
        </p>
      </div>

      {/* Placeholder State */}
      <div className="bg-white border border-[#e6e4e0] rounded-xl p-16 flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 bg-[#f0eeeb] rounded-full flex items-center justify-center mb-6">
          <ImageIcon className="h-8 w-8 text-[#b0ada8]" />
        </div>
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
          Media Library Coming Soon
        </h2>
        <p className="text-[13px] text-[#78756f] text-center max-w-sm mb-6 leading-relaxed">
          We are currently building out the central media repository where you
          can manage all uploaded covers and audio files.
        </p>
        <button className="px-5 py-2.5 text-[13px] font-semibold text-[#1a1a1a] bg-[#f0eeeb] rounded-lg hover:bg-[#e6e4e0] transition-colors cursor-not-allowed opacity-50">
          Upload Asset
        </button>
      </div>
    </div>
  );
}
