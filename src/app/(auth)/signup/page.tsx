"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function PublicSignup() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error.message || "Signup failed");

      router.push("/stories");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col font-[family-name:var(--font-outfit)]">
      <header className="h-16 w-full flex items-center justify-center border-b border-[#e6e4e0] bg-[#fafaf8]">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[#1a1a1a] hover:opacity-80 transition-opacity"
        >
          otondo
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center p-6 w-full">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tight mb-2">
              Create an account
            </h1>
            <p className="text-sm font-semibold text-[#78756f]">
              Join the adventure today
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[#fff1f0] border border-[#ffccc7] text-[#d4380d] text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                {...form.register("name")}
                className="w-full h-11 px-3 bg-[#f0eeeb] border border-[#e6e4e0] rounded-lg text-sm font-medium text-[#1a1a1a] placeholder:text-[#b0ada8] outline-none focus:border-[#1a1a1a] transition-colors"
                disabled={loading}
              />
              {form.formState.errors.name && (
                <p className="text-xs font-semibold text-[#d4380d] mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
                className="w-full h-11 px-3 bg-[#f0eeeb] border border-[#e6e4e0] rounded-lg text-sm font-medium text-[#1a1a1a] placeholder:text-[#b0ada8] outline-none focus:border-[#1a1a1a] transition-colors"
                disabled={loading}
              />
              {form.formState.errors.email && (
                <p className="text-xs font-semibold text-[#d4380d] mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                className="w-full h-11 px-3 bg-[#f0eeeb] border border-[#e6e4e0] rounded-lg text-sm font-medium text-[#1a1a1a] placeholder:text-[#b0ada8] outline-none focus:border-[#1a1a1a] transition-colors"
                disabled={loading}
              />
              {form.formState.errors.password && (
                <p className="text-xs font-semibold text-[#d4380d] mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-6 bg-[#1a1a1a] hover:bg-[#1a1a1a]/90 text-[#fafaf8] font-bold text-sm rounded-lg transition-colors"
            >
              {loading ? "Creating account..." : "Continue"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-semibold text-[#78756f]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1a1a1a] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
