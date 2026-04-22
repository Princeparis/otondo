import Link from "next/link";
import { validateUserRequest } from "@/lib/userAuth.server";
import { redirect } from "next/navigation";
import { SearchX } from "lucide-react";
import { UserAccountDropdown } from "@/components/auth/UserAccountDropdown";

import { Suspense } from "react";
import { StorySearch } from "@/components/story/StorySearch";
import { getPublicStories } from "@/lib/services/storyService";
import { StoryListClient } from "@/components/story/StoryListClient";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

  // Fetch real stories
  const { items: stories, pagination } = await getPublicStories({
    page: 1,
    pageSize: 8,
    searchQuery,
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f3efff_0%,_#fafaf8_42%)] flex flex-col font-[family-name:var(--font-outfit)]">
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

      <main
        data-lenis-prevent="true"
        className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-10 md:py-24"
      >
        <div className="mb-8 md:mb-12 max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-[#dfd8ff] bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#6f5ad9] mb-4">
            Immersive library
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] tracking-tight mb-3 md:mb-4">
            Pick a story and jump right in
          </h1>
          <p className="text-base md:text-xl text-[#78756f] font-medium leading-relaxed">
            Explore curated adventures, bedtime journeys, and educational tales with smooth search and playful browsing.
          </p>
        </div>

        <div className="mb-8 md:mb-12">
          <Suspense
            fallback={
              <div className="h-[60px] w-full max-w-xl mx-auto bg-white rounded-2xl border border-[#e6e4e0] animate-pulse" />
            }
          >
            <StorySearch />
          </Suspense>
        </div>

        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white rounded-3xl border border-[#e6e4e0] max-w-7xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-[#fafaf8] rounded-2xl flex items-center justify-center mb-6 border border-[#e6e4e0]">
              <SearchX className="h-8 w-8 text-[#b0ada8]" />
            </div>
            <h3 className="text-2xl font-black text-[#1a1a1a] mb-3">
              No stories found
            </h3>
            <p className="text-lg text-[#78756f] font-medium max-w-md mx-auto">
              We couldn&apos;t find any adventures matching your search. Try
              adjusting your filters or browsing our categories.
            </p>
          </div>
        ) : (
          <StoryListClient
            key={searchQuery}
            initialStories={stories}
            initialPagination={pagination}
            searchQuery={searchQuery}
          />
        )}
      </main>
    </div>
  );
}
