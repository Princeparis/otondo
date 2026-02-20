import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut } from "lucide-react";
import { validateUserRequest } from "@/lib/userAuth.server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { UserAccountDropdown } from "@/components/auth/UserAccountDropdown";

export default async function StoriesIndex() {
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {stories.map((s) => (
            <Link
              href={`/stories/${s.slug}`}
              key={s.slug}
              className="group flex flex-col"
            >
              {/* Cover Image Area - 4:5 Aspect Ratio */}
              <div className="relative aspect-[4/5] w-full bg-[#f0eeeb] rounded-2xl overflow-hidden mb-4 border border-[#e6e4e0]">
                {s.coverUrl ? (
                  <Image
                    src={s.coverUrl}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]/20 font-black text-6xl group-hover:scale-105 transition-transform duration-500">
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
          ))}
        </div>
      </main>
    </div>
  );
}
