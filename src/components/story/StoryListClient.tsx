"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

function generateAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return {
    bg: `hsl(${hue}, 70%, 90%)`,
    text: `hsl(${hue}, 70%, 20%)`,
    border: `hsl(${hue}, 70%, 80%)`,
  };
}

export function StoryListClient({
  initialStories,
  initialPagination,
  searchQuery,
}: {
  initialStories: any[];
  initialPagination: { page: number; pageSize: number; totalPages: number };
  searchQuery: string;
}) {
  const [stories, setStories] = useState(initialStories);
  const [page, setPage] = useState(initialPagination.page);
  const [hasMore, setHasMore] = useState(
    initialPagination.page < initialPagination.totalPages,
  );
  const [loading, setLoading] = useState(false);

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-12">
        {stories.map((s) => {
          const coverColors = generateAvatarColor(s.title);
          return (
            <Link
              href={`/stories/${s.slug}`}
              key={s.slug}
              className="group flex flex-col"
            >
              {/* Cover Image Area - 4:5 Aspect Ratio */}
              <div
                className="relative aspect-4/5 w-full rounded-xl md:rounded-2xl overflow-hidden mb-4 border transition-colors duration-500"
                style={{
                  backgroundColor: s.coverImage?.url
                    ? "#f0eeeb"
                    : coverColors.bg,
                  borderColor: s.coverImage?.url
                    ? "#e6e4e0"
                    : coverColors.border,
                }}
              >
                {s.coverImage?.url ? (
                  <Image
                    src={s.coverImage.url}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-black text-6xl group-hover:scale-105 transition-transform duration-500 p-6 text-center wrap-break-word"
                    style={{ color: coverColors.text }}
                  >
                    {s.title.charAt(0)}
                  </div>
                )}

                {/* Floating tags overlay */}
                {s.category && (
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="inline-block bg-[#fafaf8]/90 backdrop-blur-md text-[#1a1a1a] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      {s.category.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Text Content Below Cover */}
              <div className="flex flex-col px-1">
                <h3 className="text-lg font-bold text-[#1a1a1a] leading-tight mb-1 group-hover:text-[#78756f] transition-colors line-clamp-2">
                  {s.title}
                </h3>
                <span className="text-xs font-semibold text-[#78756f]">
                  Ages {s.ageRangeMin}-{s.ageRangeMax}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-12 md:mt-16 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-[#1a1a1a] bg-white border-2 border-[#1a1a1a] rounded-full overflow-hidden transition-all hover:bg-[#1a1a1a] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Load More
                <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
