"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Sparkles, Star } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { UserAccountDropdown } from "@/components/auth/UserAccountDropdown";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Story {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  ageRangeMin: number | null;
  ageRangeMax: number | null;
}

interface HomeClientProps {
  user: {
    name: string;
    email?: string;
    avatarUrl?: string | null;
  } | null;
  featuredStories: Story[];
}

function generateSettingsColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return {
    bg: `hsl(${hue}, 70%, 90%)`,
    text: `hsl(${hue}, 70%, 20%)`,
  };
}

export default function HomeClient({ user, featuredStories }: HomeClientProps) {
  const container = useRef<HTMLDivElement>(null);

  // We need to clone the stories enough times to ensure an infinite loop
  const marqueeItems = [
    ...featuredStories,
    ...featuredStories,
    ...featuredStories,
    ...featuredStories,
  ];

  useGSAP(
    () => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      lenis.on("scroll", (e: any) => {
        ScrollTrigger.update();
      });

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Hero animations
      gsap.set(".hero-badge", { opacity: 0, y: 20 });
      gsap.set(".reveal-text", { yPercent: 120, rotation: 2 });
      gsap.set(".hero-p", { opacity: 0, y: 20 });
      gsap.set(".hero-btn", { opacity: 0, scale: 0.9 });

      tl.to(".hero-badge", { opacity: 1, y: 0, duration: 1, delay: 0.2 })
        .to(
          ".reveal-text",
          { yPercent: 0, rotation: 0, duration: 1.2, stagger: 0.1 },
          "-=0.6",
        )
        .to(".hero-p", { opacity: 1, y: 0, duration: 1 }, "-=0.8")
        .to(
          ".hero-btn",
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.2)",
          },
          "-=0.8",
        );

      // Bento Box Staggers
      gsap.set(".bento-card", { y: 60, opacity: 0 });
      ScrollTrigger.batch(".bento-card", {
        start: "top 85%",
        onEnter: (elements) => {
          gsap.to(elements, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.1,
            ease: "expo.out",
            overwrite: true,
          });
        },
      });

      // Bento Internal Parallax/Floating elements
      gsap.utils.toArray(".bento-float").forEach((el: any) => {
        gsap.to(el, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // Marquee Infinite Loop
      const track = document.querySelector(".marquee-track");
      if (track) {
        // Continuous looping
        const marqueeLoop = gsap.to(track, {
          xPercent: -50,
          ease: "none",
          duration: 35,
          repeat: -1,
        });

        // Modulate timescale and direction based on scroll velocity
        let direction = 1; // 1 = forward (left), -1 = backward (right)

        lenis.on("scroll", (e: any) => {
          if (e.velocity > 0) {
            direction = 1;
          } else if (e.velocity < 0) {
            direction = -1;
          }

          gsap.to(marqueeLoop, {
            timeScale: direction * (1 + Math.abs(e.velocity) / 5),
            duration: 0.3,
            overwrite: true,
            onComplete: () => {
              gsap.to(marqueeLoop, {
                timeScale: direction,
                duration: 0.5,
                overwrite: true,
              });
            },
          });
        });
      }

      return () => lenis.destroy();
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#fafaf8] flex flex-col font-sans selection:bg-[#1a1a1a] selection:text-[#fafaf8]"
    >
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf8]/80 backdrop-blur-xl border-b border-[#e6e4e0]">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-[#1a1a1a]"
          >
            otondo
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/stories"
              className="text-sm font-semibold text-[#78756f] hover:text-[#1a1a1a] transition-colors hidden sm:block"
            >
              Stories
            </Link>
            {user ? (
              <UserAccountDropdown user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#1a1a1a] hover:opacity-70 transition-opacity"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#1a1a1a] rounded-full hover:bg-[#333] transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-6 md:pt-10 overflow-hidden">
        {/* Massive Typography Hero */}
        <section className="relative px-4 pt-32 pb-20 md:px-6 md:pt-40 md:pb-32 max-w-7xl mx-auto">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-[#f0eeeb] text-[#1a1a1a] rounded-full text-xs font-bold tracking-widest uppercase mb-8">
            <Sparkles className="h-4 w-4 text-[#c4a46d]" />
            Boundless Imagination Awaits
          </div>

          <h1 className="text-[3.5rem] md:text-[6rem] lg:text-[7.5rem] leading-[0.95] font-black sm:font-bold text-[#1a1a1a] tracking-tight mb-8">
            <div className="overflow-hidden pb-4">
              <div className="reveal-text block origin-top-left">
                Fuel their boundless
              </div>
            </div>
            <div className="overflow-hidden pb-4 flex items-center gap-4 md:gap-8 flex-wrap">
              <div className="reveal-text block origin-top-left">
                imagination.
              </div>
              {/* Decorative Pill inside text flow */}
              <div className="reveal-text inline-flex h-12 md:h-20 w-32 md:w-48 bg-linear-to-r from-[#d4e8e0] to-[#eef5ff] rounded-full items-center justify-center -rotate-3 overflow-hidden shadow-sm">
                <div className="flex gap-1 animate-pulse">
                  <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#1a1a1a]/40" />
                  <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#1a1a1a]/60" />
                  <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#1a1a1a]/80" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden pb-4">
              <div className="reveal-text block origin-top-left text-[#c4a46d]">
                One magical story at a time.
              </div>
            </div>
          </h1>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 border-t border-[#e6e4e0] pt-10">
            <div className="flex items-center gap-6">
              <div className="hero-btn h-16 w-16 rounded-full bg-[#eef5ff] flex items-center justify-center">
                <Star className="h-6 w-6 text-[#1a1a1a] fill-[#1a1a1a]" />
              </div>
              <div className="hero-p max-w-sm">
                <h3 className="font-bold text-[#1a1a1a] mb-1">
                  Turn screen time into story time
                </h3>
                <p className="text-sm text-[#78756f] leading-relaxed font-medium">
                  A universe of wonder, expertly curated and beautifully
                  narrated for developing minds.
                </p>
              </div>
            </div>

            <Link
              href="/stories"
              className="hero-btn group relative inline-flex items-center justify-center gap-3 px-8 py-5 text-lg font-bold text-white bg-[#1a1a1a] rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-xl w-full md:w-72"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              Start Reading Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Dynamic Interactive Marquee */}
        {featuredStories.length > 0 && (
          <section className="py-10 border-y border-[#e6e4e0] bg-[#fdfdfc] overflow-hidden -mx-4 md:mx-0">
            <div className="marquee-wrapper w-full flex whitespace-nowrap overflow-hidden relative py-10">
              {/* Fade masks for edges */}
              {/* <div className="absolute top-0 left-0 bottom-0 w-32 bg-linear-to-r from-[#fdfdfc] to-transparent z-10" />
              <div className="absolute top-0 right-0 bottom-0 w-32 bg-linear-to-l from-[#fdfdfc] to-transparent z-10" /> */}

              <div className="marquee-track flex gap-6 sm:gap-4 md:gap-10 lg:gap-14 items-center w-fit px-6">
                {marqueeItems.map((story, i) => {
                  const colors = generateSettingsColor(story.title);
                  return (
                    <Link
                      href={`/stories/${story.slug}`}
                      key={`${story.id}-${i}`}
                      className="shrink-0 block group overflow-hidden rounded-[1rem] md:rounded-[2.5rem] shadow-sm border border-[#e6e4e0] transition-transform hover:-translate-y-4 relative aspect-4/5"
                      style={{ width: "clamp(280px, 35vw, 600px)" }}
                    >
                      {story.coverImage ? (
                        <div className="w-full h-full relative overflow-hidden">
                          <Image
                            src={story.coverImage}
                            alt={story.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 border-4 border-transparent group-hover:border-white/20 transition-colors z-10 pointer-events-none rounded-[2.5rem]" />
                        </div>
                      ) : (
                        <div
                          className="w-full h-full relative flex flex-col justify-between p-4 md:p-12 overflow-hidden"
                          style={{ backgroundColor: colors.bg }}
                        >
                          <BookOpen
                            className="w-10 h-10 md:w-16 md:h-16 opacity-20"
                            style={{ color: colors.text }}
                          />
                          <div className="group-hover:scale-110 transition-transform duration-700 origin-bottom-left">
                            <h3
                              className="font-bold text-xl md:text-4xl lg:text-5xl leading-tight mb-4 whitespace-normal line-clamp-4"
                              style={{ color: colors.text }}
                            >
                              {story.title}
                            </h3>
                            <span
                              className="text-sm md:text-base font-medium px-4 py-2 bg-white/30 rounded-full inline-block backdrop-blur-sm"
                              style={{ color: colors.text }}
                            >
                              Ages {story.ageRangeMin}-{story.ageRangeMax}
                            </span>
                          </div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Bento Box Layout */}
        <section className="px-4 py-24 pb-40 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[380px] md:auto-rows-[450px] gap-6">
            {/* Bento 1: Large Reading Immersive */}
            <div className="bento-card col-span-1 md:col-span-8 bg-linear-to-br from-[#f0fce8] to-[#e6f4dc] rounded-[1rem] md:rounded-[2.5rem] overflow-hidden relative group p-4 md:p-14 border border-[#e2e8db]">
              <div className="relative z-10 max-w-md">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full text-xs font-bold text-[#3d5a2d] uppercase tracking-widest mb-6 border border-white">
                  <BookOpen className="h-4 w-4" /> Focus Mode
                </div>
                <h3 className="text-2xl md:text-5xl font-black text-[#2c4021] leading-tight mb-32 md:mb-8 group-hover:-translate-y-2 transition-transform duration-500">
                  Read together.
                  <br />
                  Unforgettable bonding.
                </h3>
                <p className="text-[#557344] font-medium text-lg lg:opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Distraction-free, highly legible typography engineered
                  specifically for developing readers.
                </p>
              </div>

              {/* Floating UI Element */}
              <div className="bento-float absolute right-[-5%] bottom-[-10%] w-[90%] md:w-[60%] h-[80%] bg-white rounded-t-[2rem] shadow-2xl border border-black/5 p-8 transition-transform duration-700 group-hover:scale-105 origin-bottom">
                <div className="w-16 h-4 bg-[#f0eeeb] rounded-full mb-6" />
                <div className="w-full h-8 bg-[#fafaf8] rounded-lg mb-3" />
                <div className="w-3/4 h-8 bg-[#fafaf8] rounded-lg mb-8" />
                <div className="w-full h-4 bg-[#f0eeeb] rounded-full mb-2" />
                <div className="w-5/6 h-4 bg-[#f0eeeb] rounded-full mb-2" />
                <div className="w-4/6 h-4 bg-[#f0eeeb] rounded-full" />
              </div>
            </div>

            {/* Bento 2: Audio Player */}
            <div className="bento-card col-span-1 md:col-span-4 bg-linear-to-tr from-[#eef5ff] to-[#ddeaff] rounded-[1rem] md:rounded-[2.5rem] overflow-hidden relative group p-4 md:p-10 flex flex-col justify-end border border-[#d6e5fa]">
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-black text-[#264166] leading-tight mb-2">
                  Cinematic audio playback.
                </h3>
                <p className="text-[#5474a1] font-medium">
                  Immersive voices and soundscapes across all stories.
                </p>
              </div>

              {/* Floating Audio Component Mock */}
              <div className="absolute top-10 right-10 left-10 h-24 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white flex items-center px-6 gap-4 group-hover:-translate-y-2 transition-transform duration-500">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-white ml-1" />
                </div>
                <div className="flex-1">
                  <div className="w-1/2 h-3 bg-[#1a1a1a] rounded-full mb-2" />
                  <div className="w-full h-1 bg-[#e6e4e0] rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-[#3d6da8] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bento 3: Curated Safety */}
            <div className="bento-card col-span-1 md:col-span-4 bg-linear-to-b from-[#fef6e8] to-[#fcecd2] rounded-[1rem] md:rounded-[2.5rem] overflow-hidden relative group p-4 md:p-10 border border-[#fae2c0] flex flex-col">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-auto group-hover:rotate-15 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="h-8 w-8 text-[#c4a46d]" />
              </div>
              <div className="mt-8">
                <h3 className="text-2xl md:text-3xl font-black text-[#5c4a2d] leading-tight mb-2">
                  A safe haven for little minds.
                </h3>
                <p className="text-[#8c744c] font-medium">
                  Every story is hand-picked, thoroughly vetted, and strictly
                  age-appropriate.
                </p>
              </div>
            </div>

            {/* Bento 4: Interactive Character Card */}
            <div className="bento-card col-span-1 md:col-span-8 bg-[#1a1a1a] rounded-[1rem] md:rounded-[2.5rem] overflow-hidden relative group p-4 md:p-14 flex items-center border border-[#333]">
              <div className="relative z-10 max-w-sm">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#333] rounded-full text-xs font-bold text-white uppercase tracking-widest mb-6 border border-[#444]">
                  New Releases
                </div>
                <h3 className="text-2xl md:text-5xl font-black text-white leading-tight mb-6">
                  New worlds, every single week.
                </h3>

                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-[#1a1a1a] bg-white rounded-full hover:bg-gray-100 transition-colors hover:scale-105 active:scale-95 shadow-xl"
                >
                  Explore Library
                </Link>
              </div>

              {/* Stacked Cover Cards */}
              <div className="hidden md:block absolute right-[-5%] top-1/2 -translate-y-1/2 w-[55%] h-[120%] rotate-6 group-hover:rotate-3 transition-transform duration-700">
                <div className="absolute inset-0 top-10 left-10 bg-linear-to-br from-[#d4e8e0] to-[#b8d8cc] rounded-[2rem] border border-white/20 shadow-2xl transform origin-bottom-right group-hover:-rotate-6 transition-transform duration-700" />
                <div className="absolute inset-0 bg-linear-to-br from-[#f0edf5] to-[#dbd6e8] rounded-[2rem] border border-white/20 shadow-2xl flex items-center justify-center font-black text-8xl text-[#9b8ab5]">
                  T
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Minimal CTA Bottom */}
        <section className="py-24 px-6 border-t border-[#e6e4e0] bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-5xl font-black text-[#1a1a1a] tracking-tight mb-8">
              Ready for unforgettable storytime?
            </h2>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 text-xl font-bold text-white bg-[#1a1a1a] rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Start Reading Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e6e4e0] py-12 px-6 bg-white z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-black text-xl leading-none">
              o
            </div>
            <p className="text-sm text-[#78756f] font-medium">
              © {new Date().getFullYear()} Otondo. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <Link
              href="/stories"
              className="text-sm font-medium text-[#78756f] hover:text-[#1a1a1a] transition-colors"
            >
              Stories
            </Link>
            {!user && (
              <Link
                href="/login"
                className="text-sm font-medium text-[#78756f] hover:text-[#1a1a1a] transition-colors"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/admin/login"
              className="text-sm font-medium text-[#78756f] hover:text-[#1a1a1a] transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
