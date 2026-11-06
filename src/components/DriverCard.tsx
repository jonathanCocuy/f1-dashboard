import { TEAM_COLORS } from '@/lib/constants';

interface Props {
  name: string;
  team: string;
  points: number | string;
  position: number | string;
}

export function DriverCard({ name, team, points, position }: Props) {
  const color = TEAM_COLORS[team] ?? '#86868b';

  return (
    <div className="bg-surface border border-[#2c2c2e] rounded-2xl p-4 flex items-center gap-4 hover:bg-surface-2 transition-all duration-200">
      <div className="w-1 h-12 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-secondary font-mono">P{position}</p>
        <p className="font-semibold truncate">{name}</p>
        <p className="text-xs text-text-secondary truncate">{team}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold font-mono tabular-nums">{points}</p>
        <p className="text-xs text-text-secondary">pts</p>
      </div>
    </div>
  );
}
