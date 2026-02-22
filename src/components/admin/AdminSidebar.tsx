"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Layers,
  Image as ImageIcon,
  Settings,
  LogOut,
  Users,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Stories", href: "/admin/stories", icon: BookOpen },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Media", href: "/admin/media", icon: ImageIcon },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Admins", href: "/admin/admins", icon: Shield, adminOnly: true },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  user?: { name: string; role: string };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <aside className="w-60 bg-[#fafaf8] border-r border-[#e6e4e0] flex flex-col min-h-screen font-[family-name:var(--font-space-grotesk)]">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-[#e6e4e0]">
        <Link
          href="/admin/stories"
          className="text-[15px] font-bold tracking-tight text-[#1a1a1a]"
        >
          otondo
          <span className="text-[#b0ada8] font-normal ml-1.5 text-xs tracking-widest uppercase">
            admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== "SUPER_ADMIN") return null;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[#1a1a1a] text-white"
                  : "text-[#78756f] hover:bg-[#f0eeeb] hover:text-[#1a1a1a]",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#e6e4e0]">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="h-7 w-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[10px] font-bold">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <p className="text-[13px] font-medium text-[#1a1a1a] truncate">
              {user?.name || "Admin"}
            </p>
            {user?.role === "SUPER_ADMIN" && (
              <span className="text-[10px] font-semibold text-amber-600 tracking-wider">
                SUPER ADMIN
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-[#b0ada8] hover:text-[#1a1a1a] transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
