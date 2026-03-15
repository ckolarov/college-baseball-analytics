"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Users,
  Target,
  Zap,
  Shield,
  Columns2,
  GitCompare,
  Crosshair,
  Calendar,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/players", label: "Players", icon: "users" },
  { href: "/pitchers", label: "Pitchers", icon: "target" },
  { href: "/hitters", label: "Hitters", icon: "zap" },
  { href: "/teams", label: "Teams", icon: "shield" },
  { href: "/compare/teams", label: "Compare Teams", icon: "columns" },
  { href: "/compare/players", label: "Compare Players", icon: "git-compare" },
  { href: "/matchups", label: "Matchups", icon: "crosshair" },
  { href: "/schedule", label: "Schedule", icon: "calendar" },
];

const iconMap: Record<string, LucideIcon> = {
  grid: LayoutGrid,
  users: Users,
  target: Target,
  zap: Zap,
  shield: Shield,
  columns: Columns2,
  "git-compare": GitCompare,
  crosshair: Crosshair,
  calendar: Calendar,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-white/[0.06] bg-[#0d1b2a]">
      <div className="flex h-14 items-center border-b border-white/[0.06] px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-cyan-400/20">
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <span className="gradient-text text-sm font-bold">CBA</span>
            <span className="ml-1 text-xs text-zinc-500">Analytics</span>
          </div>
        </Link>
      </div>
      <nav className="mt-4 flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const Icon = iconMap[item.icon];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "border-l-2 border-cyan-400 bg-white/[0.06] font-medium text-white"
                  : "border-l-2 border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-cyan-400" : "text-zinc-500",
                  )}
                />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
