"use client";

interface SeasonFilterProps {
  selectedSeason: number;
  seasons: number[];
  onChange: (season: number) => void;
}

export function SeasonFilter({
  selectedSeason,
  seasons,
  onChange,
}: SeasonFilterProps) {
  return (
    <select
      value={selectedSeason}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="h-8 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
    >
      {seasons.map((s) => (
        <option key={s} value={s} className="bg-[#0a1628]">
          {s}
        </option>
      ))}
    </select>
  );
}
