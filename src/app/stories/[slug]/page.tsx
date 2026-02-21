import { notFound, redirect } from "next/navigation";
import { AudioPlayer } from "@/components/story/AudioPlayer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { validateUserRequest } from "@/lib/userAuth.server";
import { ArrowLeft, BookOpen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { getStoryBySlug } from "@/lib/services/storyService";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { user } = await validateUserRequest();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  // Split plain text body into paragraphs
  const paragraphs = story.body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="relative min-h-dvh w-full bg-[#fafaf8] font-(family-name:--font-outfit) overflow-hidden flex">
      {/* DESKTOP LEFT PANE (Story Text) */}
      <div className="hidden lg:flex w-[65%] h-dvh overflow-y-auto flex-col">
        {/* Desktop Header */}
        <header className="h-20 border-b border-[#e6e4e0] bg-[#fafaf8]/80 backdrop-blur-xl flex items-center sticky top-0 z-10 w-full shrink-0">
          <div className="w-full flex items-center justify-between px-10">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-[#1a1a1a] hover:opacity-80 transition-opacity"
            >
              otondo
            </Link>
            <nav>
              <Link href="/stories">
                <span className="text-sm font-semibold text-[#1a1a1a] bg-[#f0eeeb] px-5 py-2.5 rounded-full hover:bg-[#e6e4e0] transition-colors flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Back to Stories
                </span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Desktop Text Content */}
        <main className="max-w-3xl mx-auto px-10 py-16 w-full grow">
          <article>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-block bg-[#1a1a1a] text-[#fafaf8] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest">
                  {story.category?.name || "Story"}
                </span>
                <span className="inline-block border border-[#e6e4e0] text-[#78756f] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest">
                  {story.ageRangeMin}-{story.ageRangeMax} YRS
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] leading-[1.1] tracking-tight mb-8">
                {story.title}
              </h1>
            </div>

            <div className="prose prose-lg md:prose-xl prose-p:text-[#1a1a1a]/80 prose-p:font-medium prose-p:leading-relaxed prose-p:mb-8 max-w-none">
              {paragraphs.map((content: string, idx: number) => (
                <p key={idx}>{content}</p>
              ))}
            </div>

            <div className="mt-20 pt-10 border-t border-[#e6e4e0] text-center mb-16">
              <p className="text-sm font-semibold text-[#78756f]">
                End of story.{" "}
                <Link
                  href="/stories"
                  className="text-[#1a1a1a] underline hover:no-underline"
                >
                  Find another adventure
                </Link>
                .
              </p>
            </div>
          </article>
        </main>
      </div>

      {/* MOBILE FULL SCREEN / DESKTOP RIGHT PANE (Audio Player) */}
      <div className="w-full h-dvh fixed inset-0 z-0 lg:static lg:w-[35%] lg:inset-auto lg:border-l lg:border-[#e6e4e0] bg-[#fafaf8] flex flex-col">
        {/* Mobile Header Overlay */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-24 pt-6 flex items-start px-6 z-20 bg-linear-to-b from-black/60 to-transparent">
          <Link
            href="/stories"
            className="text-white text-sm font-semibold rounded-full bg-black/20 backdrop-blur-md px-4 py-2 flex items-center gap-2 hover:bg-black/30 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        {/* The Audio Player Component (Takes full remaining space) */}
        {story.audio ? (
          <Sheet>
            <AudioPlayer
              audioUrl={story.audio.url}
              title={story.title}
              coverUrl={story.coverImage?.url ?? undefined}
              storySlug={slug}
              readStoryButton={
                <div className="lg:hidden flex items-center justify-center">
                  <SheetTrigger asChild>
                    <button className="p-3 text-[#b0ada8] hover:text-[#1a1a1a] hover:bg-[#f0eeeb] rounded-full transition-colors disabled:opacity-50">
                      <BookOpen size={24} />
                    </button>
                  </SheetTrigger>
                </div>
              }
            />
            <SheetContent
              side="bottom"
              className="h-[85dvh] rounded-t-3xl overflow-y-auto p-0 border-t-0 bg-[#fafaf8] flex flex-col font-[family-name:var(--font-outfit)]"
            >
              <SheetHeader className="p-6 pb-2 sticky top-0 bg-[#fafaf8]/95 backdrop-blur-md z-10 border-b border-[#e6e4e0] text-left">
                <SheetTitle className="text-2xl font-black text-[#1a1a1a] leading-tight">
                  {story.title}
                </SheetTitle>
                <SheetDescription className="text-[#78756f] mt-1 font-semibold text-sm">
                  Read along with the audio
                </SheetDescription>
              </SheetHeader>
              <div className="p-6 prose prose-lg prose-p:text-[#1a1a1a]/80 prose-p:font-medium prose-p:leading-relaxed max-w-none pb-24">
                {paragraphs.map((content: string, idx: number) => (
                  <p key={idx}>{content}</p>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex-1 bg-[#f0eeeb] flex flex-col items-center justify-center p-8 text-center gap-6">
            <div className="w-16 h-16 bg-[#e6e4e0] rounded-2xl flex items-center justify-center mb-2 shadow-sm">
              <BookOpen className="h-8 w-8 text-[#1a1a1a]" />
            </div>
            <p className="text-base font-bold text-[#1a1a1a] max-w-[250px]">
              This story is meant to be read, not heard just yet.
            </p>
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="bg-[#1a1a1a] text-[#fafaf8] hover:bg-[#333] rounded-full px-8 h-12 text-base font-bold flex items-center gap-2">
                    <BookOpen size={20} />
                    Read Story
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="h-[85dvh] rounded-t-3xl overflow-y-auto p-0 border-t-0 bg-[#fafaf8] flex flex-col font-[family-name:var(--font-outfit)]"
                >
                  <SheetHeader className="p-6 pb-2 sticky top-0 bg-[#fafaf8]/95 backdrop-blur-md z-10 border-b border-[#e6e4e0] text-left">
                    <SheetTitle className="text-2xl font-black text-[#1a1a1a] leading-tight">
                      {story.title}
                    </SheetTitle>
                    <SheetDescription className="text-[#78756f] mt-1 font-semibold text-sm">
                      Text version
                    </SheetDescription>
                  </SheetHeader>
                  <div className="p-6 prose prose-lg prose-p:text-[#1a1a1a]/80 prose-p:font-medium prose-p:leading-relaxed max-w-none pb-24">
                    {paragraphs.map((content: string, idx: number) => (
                      <p key={idx}>{content}</p>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
