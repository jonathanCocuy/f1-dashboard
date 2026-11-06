interface Props {
  type: string;
  isLive?: boolean;
}

export function SessionBadge({ type, isLive = false }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
      isLive
        ? 'bg-accent-red text-white'
        : 'bg-surface-2 border border-[#2c2c2e] text-text-secondary'
    }`}>
      {isLive && (
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      )}
      {isLive ? 'LIVE' : type}
    </span>
  );
}
