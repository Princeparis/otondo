import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut } from "lucide-react";
import { validateUserRequest } from "@/lib/userAuth.server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { UserAccountDropdown } from "@/components/auth/UserAccountDropdown";

import { Suspense } from "react";
import { StorySearch } from "@/components/story/StorySearch";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

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

export default async function StoriesIndex(props: Props) {
  const searchParams = await props.searchParams;
  const searchQuery =
    typeof searchParams.search === "string"
      ? searchParams.search.toLowerCase()
      : "";
  const { user } = await validateUserRequest();

  if (!user) {
    redirect("/login");
  }

  // Stub mock list until DB seeded
  const stories = [
    {
      slug: "magic-treehouse",
      title: "The Magic Treehouse",
      min: 4,
      max: 8,
      category: "Adventure",
      coverUrl: null,
    },
    {
      slug: "sleepy-bear",
      title: "Sleepy Bear's Big Day",
      min: 2,
      max: 5,
      category: "Bedtime",
      coverUrl: null,
    },
    {
      slug: "outer-space-friends",
      title: "Outer Space Friends",
      min: 6,
      max: 10,
      category: "Sci-Fi",
      coverUrl: null,
    },
    {
      slug: "the-brave-knight",
      title: "The Brave Knight",
      min: 5,
      max: 9,
      category: "Fantasy",
      coverUrl: null,
    },
  ];

  const filteredStories = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery) ||
      s.category.toLowerCase().includes(searchQuery),
  );

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col font-[family-name:var(--font-outfit)]">
      {/* Sleek Minimal Header */}
      <header className="h-16 border-b border-[#e6e4e0] bg-[#fafaf8]/80 backdrop-blur-xl flex items-center sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#1a1a1a] hover:opacity-80 transition-opacity"
          >
            otondo
          </Link>
          <div className="flex items-center gap-4">
            <UserAccountDropdown user={user} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 md:py-24">
        <div className="mb-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] tracking-tight mb-6">
            Library
          </h1>
          <p className="text-lg md:text-xl text-[#78756f] font-medium leading-relaxed">
            Explore our curated collection of adventures, bedtime stories, and
            educational tales.
          </p>
        </div>

        <div className="mb-12">
          <Suspense
            fallback={
              <div className="h-[60px] w-full max-w-xl mx-auto bg-white rounded-2xl border border-[#e6e4e0] animate-pulse" />
            }
          >
            <StorySearch />
          </Suspense>
        </div>

        {filteredStories.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">
              No stories found
            </h3>
            <p className="text-[#78756f]">
              Try adjusting your search to find more adventures.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredStories.map((s) => {
              const coverColors = generateAvatarColor(s.title);
              return (
                <Link
                  href={`/stories/${s.slug}`}
                  key={s.slug}
                  className="group flex flex-col"
                >
                  {/* Cover Image Area - 4:5 Aspect Ratio */}
                  <div
                    className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden mb-4 border transition-colors duration-500"
                    style={{
                      backgroundColor: s.coverUrl ? "#f0eeeb" : coverColors.bg,
                      borderColor: s.coverUrl ? "#e6e4e0" : coverColors.border,
                    }}
                  >
                    {s.coverUrl ? (
                      <Image
                        src={s.coverUrl}
                        alt={s.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-black text-6xl group-hover:scale-105 transition-transform duration-500"
                        style={{ color: coverColors.text }}
                      >
                        {s.title.charAt(0)}
                      </div>
                    )}

                    {/* Floating tags overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span className="inline-block bg-[#fafaf8]/90 backdrop-blur-md text-[#1a1a1a] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        {s.category}
                      </span>
                    </div>
                  </div>

                  {/* Text Content Below Cover */}
                  <div className="flex flex-col px-1">
                    <h3 className="text-lg font-bold text-[#1a1a1a] leading-tight mb-1 group-hover:text-[#78756f] transition-colors line-clamp-2">
                      {s.title}
                    </h3>
                    <span className="text-xs font-semibold text-[#78756f]">
                      Ages {s.min}-{s.max}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
