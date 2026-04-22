"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  ShieldCheck,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";
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

  const marqueeItems = [
    ...featuredStories,
    ...featuredStories,
    ...featuredStories,
    ...featuredStories,
  ];

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const lenis = new Lenis({
        duration: prefersReduced ? 0.01 : 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: !prefersReduced,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.4,
      });

      lenis.on("scroll", () => {
        ScrollTrigger.update();
      });

      const updateLenis = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);

      gsap.set(".hero-line", { yPercent: 120, rotate: 2 });
      gsap.set(".hero-copy", { opacity: 0, y: 18 });
      gsap.set(".hero-cta", { opacity: 0, y: 14, scale: 0.96 });
      gsap.set(".hero-orb", { opacity: 0, scale: 0.8, y: 20 });
      gsap.set(".nav-shell", { y: -18, opacity: 0 });

      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .to(".nav-shell", { y: 0, opacity: 1, duration: 0.7 })
        .to(
          ".hero-line",
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.05,
            stagger: 0.08,
          },
          "-=0.3",
        )
        .to(".hero-copy", { opacity: 1, y: 0, duration: 0.7 }, "-=0.65")
        .to(
          ".hero-cta",
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.08,
            duration: 0.65,
            ease: "back.out(1.2)",
          },
          "-=0.55",
        )
        .to(
          ".hero-orb",
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.06,
          },
          "-=0.5",
        );

      gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      gsap.set(".reveal-card", { y: 56, opacity: 0 });
      ScrollTrigger.batch(".reveal-card", {
        start: "top 85%",
        onEnter: (elements) => {
          gsap.to(elements, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "expo.out",
            overwrite: true,
          });
        },
      });

      gsap.utils.toArray(".parallax-layer").forEach((el) => {
        gsap.to(el as Element, {
          yPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: el as Element,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      const track = document.querySelector(".marquee-track");
      if (track) {
        const marqueeLoop = gsap.to(track, {
          xPercent: -50,
          ease: "none",
          duration: 34,
          repeat: -1,
        });

        let direction = 1;
        lenis.on("scroll", (event: unknown) => {
          const velocity =
            typeof event === "object" &&
            event !== null &&
            "velocity" in event &&
            typeof (event as { velocity: number }).velocity === "number"
              ? (event as { velocity: number }).velocity
              : 0;

          if (velocity > 0) direction = 1;
          if (velocity < 0) direction = -1;

          gsap.to(marqueeLoop, {
            timeScale: direction * (1 + Math.min(Math.abs(velocity) / 4, 2.5)),
            duration: 0.25,
            overwrite: true,
            onComplete: () => {
              gsap.to(marqueeLoop, {
                timeScale: direction,
                duration: 0.45,
                overwrite: true,
              });
            },
          });
        });
      }

      return () => {
        gsap.ticker.remove(updateLenis);
        lenis.destroy();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#f7f7f2] flex flex-col font-sans selection:bg-[#1a1a1a] selection:text-[#fafaf8]"
    >
      <div className="scroll-progress fixed top-0 left-0 z-[60] h-[3px] w-full origin-left scale-x-0 bg-linear-to-r from-[#1a1a1a] via-[#8b76ff] to-[#5bc8a8]" />

      <header className="fixed top-0 left-0 right-0 z-50 px-3 md:px-6 pt-3">
        <div className="nav-shell max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-[#e6e4e0] shadow-sm">
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

      <main className="flex-1 pt-4 md:pt-8 overflow-hidden">
        <section className="relative px-4 pt-32 pb-20 md:px-6 md:pt-44 md:pb-24 max-w-7xl mx-auto">
          <div className="absolute -top-8 right-6 md:right-24 hero-orb h-24 w-24 md:h-36 md:w-36 rounded-full bg-linear-to-br from-[#9aa7ff]/35 to-[#5bc8a8]/40 blur-2xl" />
          <div className="absolute top-52 left-2 md:left-16 hero-orb h-20 w-20 md:h-28 md:w-28 rounded-full bg-linear-to-br from-[#ffd8a4]/50 to-[#ffb4a0]/35 blur-2xl" />

          <div className="hero-copy inline-flex items-center gap-2 px-4 py-2 bg-[#efefe8] text-[#1a1a1a] rounded-full text-xs font-bold tracking-widest uppercase mb-8 border border-[#e1e0db]">
            <Sparkles className="h-4 w-4 text-[#c4a46d]" />
            Storytime, reimagined for modern families
          </div>

          <h1 className="text-[3rem] md:text-[5.75rem] lg:text-[7rem] leading-[0.93] font-black text-[#1a1a1a] tracking-tight mb-7">
            <div className="overflow-hidden pb-4">
              <div className="hero-line block origin-top-left">Brighter routines,</div>
            </div>
            <div className="overflow-hidden pb-4 flex items-center gap-4 md:gap-7 flex-wrap">
              <div className="hero-line block origin-top-left">one magical story</div>
              <div className="hero-line inline-flex h-12 md:h-20 w-30 md:w-44 bg-linear-to-r from-[#dbf1e8] to-[#e7edff] rounded-full items-center justify-center -rotate-2 overflow-hidden shadow-sm border border-white/70">
                <div className="flex gap-1 animate-pulse">
                  <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#1a1a1a]/45" />
                  <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#1a1a1a]/65" />
                  <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#1a1a1a]/85" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden pb-4">
              <div className="hero-line block origin-top-left text-[#6f5ad9]">
                at a time.
              </div>
            </div>
          </h1>

          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 items-end border-t border-[#e6e4e0] pt-10">
            <div className="space-y-7">
              <p className="hero-copy max-w-xl text-[#5f5b55] leading-relaxed text-lg font-medium">
                Otondo transforms passive screen time into rich, guided reading
                moments with cinematic narration, age-aware recommendations, and
                an interface built to calm and focus young minds.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/stories"
                  className="hero-cta group relative inline-flex items-center justify-center gap-3 px-7 py-4 text-base font-bold text-white bg-[#1a1a1a] rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-xl"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  Discover Stories
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/signup"
                  className="hero-cta inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-[#1a1a1a] bg-white rounded-full border border-[#dcdad4] hover:border-[#b7b4ad] transition-all shadow-sm"
                >
                  Start free
                </Link>
              </div>
            </div>

            <div className="reveal-card rounded-[2rem] border border-[#dad8d2] bg-white/75 backdrop-blur p-7 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold tracking-[0.14em] text-[#78756f] uppercase">
                  Tonight&apos;s snapshot
                </p>
                <Star className="h-4 w-4 fill-[#c4a46d] text-[#c4a46d]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["12k+", "Stories read"],
                  ["4.9/5", "Parent rating"],
                  ["98%", "Safe content"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-[#f5f4ef] p-4">
                    <p className="text-2xl font-black text-[#1a1a1a]">{value}</p>
                    <p className="text-xs font-semibold text-[#78756f] mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {featuredStories.length > 0 && (
          <section className="py-12 border-y border-[#e6e4e0] bg-[#fcfcf8] overflow-hidden -mx-4 md:mx-0">
            <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6 md:mb-7">
              <p className="text-xs font-bold tracking-[0.16em] text-[#78756f] uppercase">
                Trending now on Otondo
              </p>
            </div>
            <div className="marquee-wrapper w-full flex whitespace-nowrap overflow-hidden relative py-4">
              <div className="marquee-track flex gap-6 md:gap-10 lg:gap-12 items-center w-fit px-6">
                {marqueeItems.map((story, i) => {
                  const colors = generateSettingsColor(story.title);
                  return (
                    <Link
                      href={`/stories/${story.slug}`}
                      key={`${story.id}-${i}`}
                      className="shrink-0 block group overflow-hidden rounded-[1rem] md:rounded-[2.2rem] shadow-sm border border-[#e6e4e0] transition-transform hover:-translate-y-3 relative aspect-4/5"
                      style={{ width: "clamp(260px, 32vw, 520px)" }}
                    >
                      {story.coverImage ? (
                        <div className="w-full h-full relative overflow-hidden">
                          <Image
                            src={story.coverImage}
                            alt={story.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/35 to-transparent" />
                          <p className="absolute left-5 bottom-5 text-white font-bold text-xl max-w-[80%] whitespace-normal leading-tight">
                            {story.title}
                          </p>
                        </div>
                      ) : (
                        <div
                          className="w-full h-full relative flex flex-col justify-between p-5 md:p-10 overflow-hidden"
                          style={{ backgroundColor: colors.bg }}
                        >
                          <BookOpen
                            className="w-10 h-10 md:w-14 md:h-14 opacity-20"
                            style={{ color: colors.text }}
                          />
                          <div className="group-hover:scale-105 transition-transform duration-700 origin-bottom-left">
                            <h3
                              className="font-black text-2xl md:text-4xl leading-tight mb-4 whitespace-normal line-clamp-4"
                              style={{ color: colors.text }}
                            >
                              {story.title}
                            </h3>
                            <span
                              className="text-sm md:text-base font-semibold px-4 py-2 bg-white/45 rounded-full inline-block backdrop-blur-sm"
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

        <section className="px-4 py-24 pb-36 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[320px] md:auto-rows-[410px] gap-5 md:gap-6">
            <div className="reveal-card col-span-1 md:col-span-8 bg-linear-to-br from-[#f0fce8] to-[#e6f4dc] rounded-[1rem] md:rounded-[2.2rem] overflow-hidden relative group p-6 md:p-12 border border-[#e2e8db]">
              <div className="relative z-10 max-w-md">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full text-xs font-bold text-[#3d5a2d] uppercase tracking-widest mb-6 border border-white">
                  <BookOpen className="h-4 w-4" /> Focus Mode
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-[#2c4021] leading-tight mb-24 md:mb-8 group-hover:-translate-y-2 transition-transform duration-500">
                  Read together.
                  <br />
                  Better bedtime flow.
                </h3>
                <p className="text-[#557344] font-medium text-lg lg:opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Clean typography and smart spacing keep little readers focused
                  and curious.
                </p>
              </div>

              <div className="parallax-layer absolute right-[-5%] bottom-[-10%] w-[90%] md:w-[60%] h-[80%] bg-white rounded-t-[2rem] shadow-2xl border border-black/5 p-8 transition-transform duration-700 group-hover:scale-105 origin-bottom">
                <div className="w-16 h-4 bg-[#f0eeeb] rounded-full mb-6" />
                <div className="w-full h-8 bg-[#fafaf8] rounded-lg mb-3" />
                <div className="w-3/4 h-8 bg-[#fafaf8] rounded-lg mb-8" />
                <div className="w-full h-4 bg-[#f0eeeb] rounded-full mb-2" />
                <div className="w-5/6 h-4 bg-[#f0eeeb] rounded-full mb-2" />
                <div className="w-4/6 h-4 bg-[#f0eeeb] rounded-full" />
              </div>
            </div>

            <div className="reveal-card col-span-1 md:col-span-4 bg-linear-to-tr from-[#eef5ff] to-[#ddeaff] rounded-[1rem] md:rounded-[2.2rem] overflow-hidden relative group p-6 md:p-10 flex flex-col justify-end border border-[#d6e5fa]">
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-black text-[#264166] leading-tight mb-2">
                  Cinematic listening.
                </h3>
                <p className="text-[#5474a1] font-medium">
                  Narration quality that turns every tale into an experience.
                </p>
              </div>

              <div className="absolute top-9 right-8 left-8 h-24 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white flex items-center px-5 gap-4 group-hover:-translate-y-2 transition-transform duration-500">
                <div className="w-11 h-11 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="w-1/2 h-3 bg-[#1a1a1a] rounded-full mb-2" />
                  <div className="w-full h-1 bg-[#e6e4e0] rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-[#3d6da8] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal-card col-span-1 md:col-span-4 bg-linear-to-b from-[#fef6e8] to-[#fcecd2] rounded-[1rem] md:rounded-[2.2rem] overflow-hidden relative group p-6 md:p-10 border border-[#fae2c0] flex flex-col">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-auto group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="h-8 w-8 text-[#b47e39]" />
              </div>
              <div className="mt-8">
                <h3 className="text-2xl md:text-3xl font-black text-[#5c4a2d] leading-tight mb-2">
                  Safe by design.
                </h3>
                <p className="text-[#8c744c] font-medium">
                  Human-reviewed catalog and age-aware discovery for trusted
                  family moments.
                </p>
              </div>
            </div>

            <div className="reveal-card col-span-1 md:col-span-8 bg-[#17181b] rounded-[1rem] md:rounded-[2.2rem] overflow-hidden relative group p-6 md:p-12 flex items-center border border-[#2a2a33]">
              <div className="relative z-10 max-w-sm">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#272935] rounded-full text-xs font-bold text-white uppercase tracking-widest mb-6 border border-[#35384a]">
                  <WandSparkles className="h-4 w-4" /> New weekly additions
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                  Fresh adventures,
                  <br />
                  every week.
                </h3>

                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-[#1a1a1a] bg-white rounded-full hover:bg-gray-100 transition-colors hover:scale-105 active:scale-95 shadow-xl"
                >
                  Explore Library
                </Link>
              </div>

              <div className="hidden md:block absolute right-[-3%] top-1/2 -translate-y-1/2 w-[55%] h-[118%] rotate-6 group-hover:rotate-3 transition-transform duration-700">
                <div className="absolute inset-0 top-10 left-10 bg-linear-to-br from-[#d4e8e0] to-[#b8d8cc] rounded-[2rem] border border-white/20 shadow-2xl transform origin-bottom-right group-hover:-rotate-6 transition-transform duration-700" />
                <div className="absolute inset-0 bg-linear-to-br from-[#f0edf5] to-[#dbd6e8] rounded-[2rem] border border-white/20 shadow-2xl flex items-center justify-center font-black text-8xl text-[#9b8ab5]">
                  T
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 border-t border-[#e6e4e0] bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black text-[#1a1a1a] tracking-tight mb-4">
              Ready to elevate storytime tonight?
            </h2>
            <p className="text-[#66645e] font-medium mb-8">
              Join parents who are building calmer routines with high-quality,
              narrated stories.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 text-xl font-bold text-white bg-[#1a1a1a] rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Start Reading Free
            </Link>
          </div>
        </section>
      </main>

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
