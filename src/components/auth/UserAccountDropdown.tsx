"use client";

import Link from "next/link";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAccountDropdownProps {
  user: {
    name: string;
    email?: string;
    avatarUrl?: string | null;
  };
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
  };
}

export function UserAccountDropdown({ user }: UserAccountDropdownProps) {
  // Create initials from the name (e.g., "John Doe" -> "JD")
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  const avatarColors = generateAvatarColor(user.name || "User");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-10 w-10 border-2 border-[#e6e4e0] hover:border-[#1a1a1a] transition-colors cursor-pointer ring-offset-[#fafaf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.name} />
          )}
          <AvatarFallback
            style={{
              backgroundColor: avatarColors.bg,
              color: avatarColors.text,
            }}
            className="font-bold text-sm"
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 font-[family-name:var(--font-outfit)]"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-[#1a1a1a]">
              {user.name}
            </p>
            {user.email && (
              <p className="text-xs leading-none text-[#78756f]">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="cursor-pointer text-[#1a1a1a] hover:bg-[#f0eeeb] focus:bg-[#f0eeeb]"
        >
          <Link href="/settings" className="w-full flex items-center">
            <Settings className="mr-2 h-4 w-4 text-[#78756f]" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 hover:text-red-600"
        >
          <a href="/api/auth/logout" className="w-full flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
