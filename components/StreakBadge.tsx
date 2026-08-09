// Contador de ofensiva (streak) de dias seguidos estudando.
export default function StreakBadge({ dias }: { dias: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-sand-300 bg-paper-raised px-3 py-1 text-sm font-medium text-ink">
      <span aria-hidden>🔥</span>
      <span>{dias}</span>
    </div>
  );
}
