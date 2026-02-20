"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error.message || "Login failed");

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8] px-4 font-[family-name:var(--font-space-grotesk)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-xl font-bold tracking-tight text-[#1a1a1a]">
            otondo
          </h1>
          <p className="text-[13px] text-[#b0ada8] mt-1 tracking-wide uppercase">
            Admin Console
          </p>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="px-4 py-3 text-[13px] font-medium text-[#dc4a3f] bg-[#fef0ef] border border-[#fcd8d5] rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@otondo.com"
              {...form.register("email")}
              className="w-full h-10 px-3 text-sm bg-white border border-[#e6e4e0] rounded-lg outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors placeholder:text-[#b0ada8]"
            />
            {form.formState.errors.email && (
              <p className="text-[12px] text-[#dc4a3f] mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
              className="w-full h-10 px-3 text-sm bg-white border border-[#e6e4e0] rounded-lg outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-colors placeholder:text-[#b0ada8]"
            />
            {form.formState.errors.password && (
              <p className="text-[12px] text-[#dc4a3f] mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 text-sm font-semibold text-white bg-[#1a1a1a] rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#b0ada8] mt-8">
          Protected area. Authorized administrators only.
        </p>
      </div>
    </div>
  );
}
