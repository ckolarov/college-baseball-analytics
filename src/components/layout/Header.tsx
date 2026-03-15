"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/players?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-[#0a1628]/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-zinc-400">
          College Baseball Analytics
        </h2>
      </div>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search players, teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-64 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
        />
      </form>
    </header>
  );
}
