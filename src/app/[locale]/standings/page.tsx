'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchJolpica } from '@/lib/api';
import { TEAM_COLORS } from '@/lib/constants';
import type { ErgastDriverStanding, ErgastConstructorStanding } from '@/types/f1';

export default function StandingsPage() {
  const [tab, setTab] = useState<'drivers' | 'constructors'>('drivers');
  const [season, setSeason] = useState('current');

  const { data: driversData } = useQuery({
    queryKey: ['driver-standings', season],
    queryFn: () => fetchJolpica<any>(`/${season}/driverStandings.json`),
  });

  const { data: constructorsData } = useQuery({
    queryKey: ['constructor-standings', season],
    queryFn: () => fetchJolpica<any>(`/${season}/constructorStandings.json`),
  });

  const drivers: ErgastDriverStanding[] =
    driversData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
  const constructors: ErgastConstructorStanding[] =
    constructorsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

  const seasons = Array.from({ length: 10 }, (_, i) => String(2024 - i));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Standings</h1>
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="bg-surface-2 border border-[#2c2c2e] rounded-xl px-3 py-1.5 text-sm text-text-primary"
        >
          <option value="current">Current</option>
          {seasons.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['drivers', 'constructors'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === t
                ? 'bg-accent-red text-white'
                : 'bg-surface border border-[#2c2c2e] text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-[#2c2c2e] rounded-2xl overflow-hidden">
        {tab === 'drivers' ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2c2c2e]">
                <th className="text-left p-4 text-xs text-text-secondary font-medium uppercase">#</th>
                <th className="text-left p-4 text-xs text-text-secondary font-medium uppercase">Driver</th>
                <th className="text-left p-4 text-xs text-text-secondary font-medium uppercase hidden md:table-cell">Team</th>
                <th className="text-right p-4 text-xs text-text-secondary font-medium uppercase">Pts</th>
                <th className="text-right p-4 text-xs text-text-secondary font-medium uppercase hidden md:table-cell">Wins</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const color = TEAM_COLORS[d.Constructors[0]?.name] ?? '#86868b';
                return (
                  <tr key={d.Driver.driverId} className="border-b border-[#2c2c2e] last:border-0 hover:bg-surface-2 transition-colors">
                    <td className="p-4 font-mono text-sm text-text-secondary">{d.position}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium">{d.Driver.givenName} {d.Driver.familyName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-secondary hidden md:table-cell">{d.Constructors[0]?.name}</td>
                    <td className="p-4 text-right font-mono font-semibold text-sm">{d.points}</td>
                    <td className="p-4 text-right font-mono text-sm text-text-secondary hidden md:table-cell">{d.wins}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2c2c2e]">
                <th className="text-left p-4 text-xs text-text-secondary font-medium uppercase">#</th>
                <th className="text-left p-4 text-xs text-text-secondary font-medium uppercase">Constructor</th>
                <th className="text-right p-4 text-xs text-text-secondary font-medium uppercase">Pts</th>
                <th className="text-right p-4 text-xs text-text-secondary font-medium uppercase hidden md:table-cell">Wins</th>
              </tr>
            </thead>
            <tbody>
              {constructors.map((c) => {
                const color = TEAM_COLORS[c.Constructor.name] ?? '#86868b';
                return (
                  <tr key={c.Constructor.constructorId} className="border-b border-[#2c2c2e] last:border-0 hover:bg-surface-2 transition-colors">
                    <td className="p-4 font-mono text-sm text-text-secondary">{c.position}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium">{c.Constructor.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-semibold text-sm">{c.points}</td>
                    <td className="p-4 text-right font-mono text-sm text-text-secondary hidden md:table-cell">{c.wins}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
