"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Dashboard" },
  { href: "/pitchers", label: "Pitchers" },
  { href: "/hitters", label: "Hitters" },
  { href: "/teams", label: "Teams" },
];

export function Header() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/players?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a1628]/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative px-3 py-4 text-sm transition-colors",
                  isActive
                    ? "font-medium text-white"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400" />
                )}
              </Link>
            );
          })}
        </nav>
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search players, teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-64 rounded-lg border border-white/[0.08] bg-white/[0.04] pl-8 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-400/30 focus:outline-none"
          />
        </form>
      </div>
    </header>
  );
}
