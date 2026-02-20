"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Sparkles } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { UserAccountDropdown } from "@/components/auth/UserAccountDropdown";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomeClientProps {
  user: {
    name: string;
    email?: string;
    avatarUrl?: string | null;
  } | null;
}

export default function HomeClient({ user }: HomeClientProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Initialize Lenis Smooth Scrolling
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      // 2. Initial Hero Stagger Animation
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Setup initial states
      gsap.set(".reveal-text", { yPercent: 120, rotation: 2 });
      gsap.set(".hero-badge", { opacity: 0, scale: 0.8, y: 20 });
      gsap.set(".hero-desc", { opacity: 0, y: 30 });
      gsap.set(".hero-btn", { opacity: 0, scale: 0.9, y: 20 });
      gsap.set(".blob-1", { scale: 0.8, opacity: 0 });
      gsap.set(".blob-2", { scale: 0.8, opacity: 0 });

      tl.to(".hero-badge", {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1,
        delay: 0.2,
        ease: "back.out(1.5)",
      })
        .to(
          ".reveal-text",
          { yPercent: 0, rotation: 0, duration: 1.2, stagger: 0.15 },
          "-=0.6",
        )
        .to(".hero-desc", { opacity: 1, y: 0, duration: 1.2 }, "-=0.8")
        .to(
          ".hero-btn",
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.2)",
          },
          "-=1",
        )
        .to(
          ".blob-1",
          { scale: 1, opacity: 0.4, duration: 2, ease: "power2.out" },
          "-=1.5",
        )
        .to(
          ".blob-2",
          { scale: 1, opacity: 0.3, duration: 2, ease: "power2.out" },
          "-=1.8",
        );

      // 3. Parallax Floating Blobs
      gsap.to(".blob-1", {
        yPercent: 40,
        xPercent: -10,
        rotation: 25,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(".blob-2", {
        yPercent: -60,
        xPercent: 15,
        rotation: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // 4. Scroll Trigger for Features section (Staggered Reveal)
      gsap.set(".feature-card", { y: 100, opacity: 0, scale: 0.95 });
      ScrollTrigger.batch(".feature-card", {
        start: "top 85%",
        onEnter: (elements) => {
          gsap.to(elements, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            stagger: 0.15,
            ease: "power4.out",
            overwrite: true,
          });
        },
        onLeaveBack: (elements) => {
          gsap.to(elements, {
            y: 100,
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            overwrite: true,
          });
        },
      });

      // 5. Scroll Trigger for CTA (Magnetic Expansion)
      gsap.set(".cta-content", {
        scale: 0.9,
        opacity: 0.5,
        borderRadius: "100px",
      });
      gsap.to(".cta-content", {
        scale: 1,
        opacity: 1,
        borderRadius: "24px",
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 90%",
          end: "center center",
          scrub: 1.2, // Smooth scrubbing
        },
      });

      return () => {
        lenis.destroy();
      };
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="min-h-screen bg-[#fafaf8] flex flex-col font-sans"
    >
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf8]/80 backdrop-blur-xl border-b border-[#e6e4e0]">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#1a1a1a]"
          >
            otondo
          </Link>
          <nav className="flex items-center gap-2 md:gap-4">
            <Link
              href="/stories"
              className="px-4 py-2 text-sm font-medium text-[#78756f] hover:text-[#1a1a1a] transition-colors hidden sm:block"
            >
              Stories
            </Link>
            {user ? (
              <UserAccountDropdown user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[#78756f] hover:text-[#1a1a1a] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1a1a1a] rounded-full hover:bg-[#333] transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden hero-section min-h-[90vh] flex flex-col items-center justify-center">
          {/* Subtle Parallax Background Blobs */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fef6e8] via-[#fdf0dc] to-[#fafaf8] -z-10" />
          <div className="blob-1 absolute top-20 right-[15%] w-72 h-72 bg-[#fcd8b0] rounded-full blur-[120px] opacity-40 -z-10" />
          <div className="blob-2 absolute bottom-10 left-[10%] w-96 h-96 bg-[#d4e8e0] rounded-full blur-[120px] opacity-30 -z-10" />

          <div className="relative max-w-5xl mx-auto text-center px-6 py-20 overflow-hidden">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 border border-[#e6e4e0] rounded-full text-sm font-medium text-[#78756f] mb-10 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#c4a46d]" />
              Stories designed for curious minds
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-bold text-[#1a1a1a] leading-[1.05] tracking-tight mb-8">
              <div className="overflow-hidden pb-4">
                <div className="reveal-text inline-block origin-top-left">
                  Where every story
                </div>
              </div>
              <div className="overflow-hidden pb-6">
                <div className="reveal-text inline-block origin-top-left">
                  sparks a new{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">adventure</span>
                    <span className="absolute bottom-3 left-0 right-0 h-4 bg-[#fcd8b0] rounded-full -z-0" />
                  </span>
                </div>
              </div>
            </h1>

            <p className="hero-desc text-lg md:text-2xl text-[#78756f] max-w-2xl mx-auto leading-relaxed mb-12 font-normal">
              A curated library of read-along and audio stories crafted for
              children. Beautifully narrated, thoughtfully written, endlessly
              engaging.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/stories"
                className="hero-btn inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-[#1a1a1a] rounded-full hover:bg-[#333] transition-all hover:gap-3 hover:scale-105 active:scale-95 shadow-xl"
              >
                Explore Stories
                <ArrowRight className="h-5 w-5" />
              </Link>
              {!user && (
                <Link
                  href="/signup"
                  className="hero-btn inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-[#1a1a1a] bg-white border border-[#e6e4e0] rounded-full hover:bg-[#f0eeeb] transition-colors hover:scale-105 active:scale-95 shadow-sm"
                >
                  Create free account
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-32 px-6 features-section relative z-10 bg-[#fafaf8]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24">
              <div className="overflow-hidden mb-4">
                <p className="reveal-text text-sm font-semibold text-[#c4a46d] uppercase tracking-widest inline-block">
                  How it works
                </p>
              </div>
              <div className="overflow-hidden pb-4">
                <h2 className="reveal-text text-4xl md:text-5xl font-bold text-[#1a1a1a] tracking-tight inline-block">
                  Stories made simple
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="feature-card group bg-white border border-[#e6e4e0] rounded-[24px] p-10 hover:border-[#d4d2ce] transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] cursor-default">
                <div className="h-14 w-14 bg-[#fef6e8] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
                  <BookOpen className="h-6 w-6 text-[#c4a46d]" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                  Read together
                </h3>
                <p className="text-[#78756f] text-base leading-relaxed">
                  Large, child-friendly text and clean layouts make storytime a
                  warm and engaging experience.
                </p>
              </div>

              {/* Card 2 */}
              <div className="feature-card group bg-white border border-[#e6e4e0] rounded-[24px] p-10 hover:border-[#d4d2ce] transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] cursor-default">
                <div className="h-14 w-14 bg-[#eef5f1] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 ease-out">
                  <Headphones className="h-6 w-6 text-[#7ab5a0]" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                  Listen along
                </h3>
                <p className="text-[#78756f] text-base leading-relaxed">
                  Professionally narrated audio lets little ones follow along,
                  building literacy at their own pace.
                </p>
              </div>

              {/* Card 3 */}
              <div className="feature-card group bg-white border border-[#e6e4e0] rounded-[24px] p-10 hover:border-[#d4d2ce] transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] cursor-default">
                <div className="h-14 w-14 bg-[#f0edf5] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
                  <Sparkles className="h-6 w-6 text-[#9b8ab5]" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                  Curated with care
                </h3>
                <p className="text-[#78756f] text-base leading-relaxed">
                  Every story is hand-picked and reviewed to be safe,
                  age-appropriate, and genuinely fun.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 cta-section overflow-hidden bg-[#fafaf8]">
          <div className="cta-content max-w-5xl mx-auto text-center bg-[#fef6e8] border border-[#f0e4cc] rounded-3xl p-16 md:p-24 shadow-sm">
            <h2 className="text-4xl md:text-6xl font-bold text-[#1a1a1a] tracking-tight mb-6 leading-tight">
              Start reading tonight
            </h2>
            <p className="text-[#78756f] text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of families who make bedtime magical with Otondo
              stories.
            </p>
            {!user ? (
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 px-10 py-5 text-lg font-semibold text-white bg-[#1a1a1a] rounded-full hover:bg-[#333] transition-all hover:gap-4 hover:scale-105 active:scale-95 shadow-xl"
              >
                Create free account
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/stories"
                className="inline-flex items-center gap-3 px-10 py-5 text-lg font-semibold text-white bg-[#1a1a1a] rounded-full hover:bg-[#333] transition-all hover:gap-4 hover:scale-105 active:scale-95 shadow-xl"
              >
                Read stories now
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e6e4e0] py-12 px-6 bg-white z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-[#78756f] font-medium">
            © {new Date().getFullYear()} Otondo. All rights reserved.
          </p>
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
