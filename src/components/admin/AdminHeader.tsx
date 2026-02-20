"use client";

import { Bell, Search } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="h-14 border-b border-[#e6e4e0] bg-white/60 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10 font-[family-name:var(--font-space-grotesk)]">
      {/* Search */}
      <div className="flex items-center gap-2 text-[#b0ada8]">
        <Search className="h-4 w-4" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm font-medium text-[#1a1a1a] placeholder:text-[#b0ada8] outline-none w-48"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-[#78756f] hover:text-[#1a1a1a] transition-colors rounded-lg hover:bg-[#f0eeeb]">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#e8927c]" />
        </button>
      </div>
    </header>
  );
}
