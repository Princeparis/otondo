"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, X } from "lucide-react";
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      router.replace(`/stories?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, router, searchParams]);

  useGSAP(
    () => {
      if (isFocused) {
        gsap.to(containerRef.current, {
          scale: 1.01,
          boxShadow: "0 16px 40px rgba(70, 45, 150, 0.15)",
          borderColor: "#6f5ad9",
          duration: 0.35,
          ease: "back.out(1.4)",
        });
      } else {
        gsap.to(containerRef.current, {
          scale: 1,
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
          borderColor: "#e6e4e0",
          duration: 0.28,
          ease: "power2.out",
        });
      }
    },
    { dependencies: [isFocused], scope: containerRef },
  );

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center bg-white border rounded-3xl overflow-hidden transition-colors"
    >
      <div className="pl-5 pr-3 text-[#6f5ad9]">
        <Search className="h-5 w-5" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search magical adventures..."
        className="flex-1 py-4 bg-transparent outline-none text-lg text-[#1a1a1a] placeholder:text-[#aaa69e] font-medium"
      />
      {query ? (
        <button onClick={handleClear} className="pr-5 pl-3 text-[#b0ada8] hover:text-[#1a1a1a] transition-colors">
          <X className="h-5 w-5" />
        </button>
      ) : (
        <div className="hidden md:flex items-center gap-1.5 pr-5 text-[#9b96c5] text-xs font-bold tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5" /> Live search
        </div>
      )}
    </div>
  );
}
