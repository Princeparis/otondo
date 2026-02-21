"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function StorySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || "";

  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      // Replace instead of push to avoid building a huge history stack while typing
      router.replace(`/stories?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, router, searchParams]);

  useGSAP(() => {
    if (isFocused) {
      gsap.to(containerRef.current, {
        scale: 1.02,
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        duration: 0.4,
        ease: "back.out(1.5)",
      });
    } else {
      gsap.to(containerRef.current, {
        scale: 1,
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isFocused]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex items-center bg-white border rounded-2xl overflow-hidden transition-colors duration-300 ${
        isFocused ? "border-[#1a1a1a]" : "border-[#e6e4e0]"
      }`}
    >
      <div className="pl-5 pr-3 text-[#b0ada8]">
        <Search
          className={`h-5 w-5 transition-colors duration-300 ${isFocused ? "text-[#1a1a1a]" : ""}`}
        />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search for an adventure..."
        className="flex-1 py-4 bg-transparent outline-none text-lg text-[#1a1a1a] placeholder:text-[#b0ada8] font-medium"
      />
      {query && (
        <button
          onClick={handleClear}
          className="pr-5 pl-3 text-[#b0ada8] hover:text-[#1a1a1a] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
