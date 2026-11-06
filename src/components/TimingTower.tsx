'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOpenF1 } from '@/lib/api';
import { TEAM_COLORS } from '@/lib/constants';
import type { Driver, Position, Lap } from '@/types/f1';

interface Props {
  sessionKey: number;
}

function formatLapTime(seconds: number | null): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, '0');
  return m > 0 ? `${m}:${s}` : `${s}`;
}

export function TimingTower({ sessionKey }: Props) {
  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ['drivers', sessionKey],
    queryFn: () => fetchOpenF1(`/drivers?session_key=${sessionKey}`),
  });

  const { data: positions } = useQuery<Position[]>({
    queryKey: ['positions', sessionKey],
    queryFn: () => fetchOpenF1(`/position?session_key=${sessionKey}`),
    refetchInterval: 5000,
  });

  const { data: laps } = useQuery<Lap[]>({
    queryKey: ['laps', sessionKey],
    queryFn: () => fetchOpenF1(`/laps?session_key=${sessionKey}`),
    refetchInterval: 5000,
  });

  const driverMap = new Map(drivers?.map((d) => [d.driver_number, d]) ?? []);

  const latestPositions = positions
    ? Object.values(
        positions.reduce<Record<number, Position>>((acc, p) => {
          if (!acc[p.driver_number] || p.date > acc[p.driver_number].date) {
            acc[p.driver_number] = p;
          }
          return acc;
        }, {})
      ).sort((a, b) => a.position - b.position)
    : [];

  const lastLapMap = laps
    ? laps.reduce<Record<number, Lap>>((acc, l) => {
        if (!acc[l.driver_number] || l.lap_number > acc[l.driver_number].lap_number) {
          acc[l.driver_number] = l;
        }
        return acc;
      }, {})
    : {};

  return (
    <div className="bg-surface border border-[#2c2c2e] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-[#2c2c2e]">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Live Timing</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2c2c2e]">
              {['Pos', 'Driver', 'Team', 'Last Lap', 'Gap'].map((h) => (
                <th key={h} className="text-left p-3 text-xs text-text-secondary font-medium uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {latestPositions.map(({ driver_number, position }) => {
              const driver = driverMap.get(driver_number);
              const lastLap = lastLapMap[driver_number];
              const teamColor = driver ? (TEAM_COLORS[driver.team_name] ?? '#86868b') : '#86868b';

              return (
                <tr key={driver_number} className="border-b border-[#2c2c2e] last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="p-3 font-mono text-sm w-8">{position}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: teamColor }} />
                      <div>
                        <p className="text-sm font-medium">{driver?.broadcast_name ?? `#${driver_number}`}</p>
                        <p className="text-xs text-text-secondary font-mono">{driver?.name_acronym}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-text-secondary hidden md:table-cell">{driver?.team_name}</td>
                  <td className="p-3 font-mono text-sm tabular-nums">
                    {formatLapTime(lastLap?.lap_duration ?? null)}
                  </td>
                  <td className="p-3 font-mono text-sm text-text-secondary">—</td>
                </tr>
              );
            })}
            {latestPositions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-secondary text-sm">
                  Waiting for timing data…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
