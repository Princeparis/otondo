"use client";

import { Settings } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight">
          Settings
        </h1>
        <p className="text-[13px] text-[#b0ada8] mt-0.5">
          Configure application preferences
        </p>
      </div>

      {/* Placeholder State */}
      <div className="bg-white border border-[#e6e4e0] rounded-xl p-16 flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-16 w-16 bg-[#f0eeeb] rounded-full flex items-center justify-center mb-6">
          <Settings className="h-8 w-8 text-[#b0ada8]" />
        </div>
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
          Settings Under Construction
        </h2>
        <p className="text-[13px] text-[#78756f] text-center max-w-sm mb-6 leading-relaxed">
          Application configuration and user management settings will be
          available here in a future update.
        </p>
      </div>
    </div>
  );
}
