import { TEAM_COLORS } from '@/lib/constants';

interface Props {
  teamName: string;
  className?: string;
}

export function TeamColorBar({ teamName, className = '' }: Props) {
  const color = TEAM_COLORS[teamName] ?? '#86868b';
  return (
    <div
      className={`w-1 rounded-full ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
