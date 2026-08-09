// Contador de ofensiva (streak) de dias seguidos estudando.
export default function StreakBadge({ dias }: { dias: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-500">
      <span aria-hidden>🔥</span>
      <span>{dias}</span>
    </div>
  );
}
