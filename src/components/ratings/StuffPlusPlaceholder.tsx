export function StuffPlusPlaceholder() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-zinc-500">
        S+
      </div>
      <div>
        <div className="text-sm font-medium text-zinc-500">Stuff+</div>
        <div className="text-xs text-zinc-600">
          Coming Soon — Requires TrackMan Data
        </div>
      </div>
    </div>
  );
}
