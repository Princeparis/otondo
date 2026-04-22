"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function generateAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return {
    bg: `hsl(${hue}, 80%, 95%)`,
    text: `hsl(${hue}, 60%, 28%)`,
    border: `hsl(${hue}, 65%, 84%)`,
  };
}

interface StoryItem {
  slug: string;
  title: string;
  ageRangeMin: number | null;
  ageRangeMax: number | null;
  coverImage?: { url: string } | null;
  category?: { name: string } | null;
}

export function StoryListClient({
  initialStories,
  initialPagination,
  searchQuery,
}: {
  initialStories: StoryItem[];
  initialPagination: { page: number; pageSize: number; totalPages: number };
  searchQuery: string;
}) {
  const [stories, setStories] = useState(initialStories);
  const [page, setPage] = useState(initialPagination.page);
  const [hasMore, setHasMore] = useState(
    initialPagination.page < initialPagination.totalPages,
  );
  const [loading, setLoading] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".story-card",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.06,
          ease: "power3.out",
        },
      );
    },
    { dependencies: [stories.length], scope: listRef },
  );

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({
        page: nextPage.toString(),
        pageSize: initialPagination.pageSize.toString(),
      });
      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const res = await fetch(`/api/stories?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch stories");
      const data = await res.json();

      setStories((prev) => [...prev, ...data.items]);
      setPage(nextPage);
      setHasMore(nextPage < data.pagination.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 rounded-2xl border border-[#ece8df] bg-white/80 backdrop-blur px-4 py-3 text-sm font-semibold text-[#6e6a63] inline-flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#6f5ad9]" />
        {stories.length} {stories.length === 1 ? "story" : "stories"} ready to explore
      </div>

      <div ref={listRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-10">
        {stories.map((s) => {
          const coverColors = generateAvatarColor(s.title);
          return (
            <Link href={`/stories/${s.slug}`} key={s.slug} className="story-card group flex flex-col">
              <div
                className="relative aspect-4/5 w-full rounded-2xl overflow-hidden mb-3 border transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_20px_30px_-20px_rgba(70,45,150,0.45)]"
                style={{
                  backgroundColor: s.coverImage?.url ? "#f0eeeb" : coverColors.bg,
                  borderColor: s.coverImage?.url ? "#e6e4e0" : coverColors.border,
                }}
              >
                {s.coverImage?.url ? (
                  <Image
                    src={s.coverImage.url}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-black text-6xl group-hover:scale-110 transition-transform duration-500 p-6 text-center"
                    style={{ color: coverColors.text }}
                  >
                    {s.title.charAt(0)}
                  </div>
                )}

                {s.category && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-block bg-white/90 backdrop-blur-md text-[#1a1a1a] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      {s.category.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col px-1">
                <h3 className="text-base md:text-lg font-bold text-[#1a1a1a] leading-tight mb-1 group-hover:text-[#6f5ad9] transition-colors line-clamp-2">
                  {s.title}
                </h3>
                <span className="text-xs md:text-sm font-semibold text-[#78756f]">
                  Ages {s.ageRangeMin}-{s.ageRangeMax}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-12 md:mt-14 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-[#1a1a1a] border border-[#1a1a1a] rounded-full overflow-hidden transition-all hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Load More Stories
                <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
