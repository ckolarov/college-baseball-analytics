"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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

const iconMap: Record<string, string> = {
  grid: "⊞",
  users: "👥",
  target: "🎯",
  zap: "⚡",
  shield: "🛡",
  columns: "⟺",
  "git-compare": "⇄",
  crosshair: "◎",
  calendar: "📅",
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-white/10 bg-[#0d1b2a]">
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">⚾ CBA</span>
          <span className="text-xs text-zinc-400">Analytics</span>
        </Link>
      </div>
      <nav className="mt-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <span className="w-5 text-center text-xs">
                {iconMap[item.icon] || "•"}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
