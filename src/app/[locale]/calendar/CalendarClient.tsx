'use client';

import { useState } from 'react';
import { CircuitMap } from '@/components/CircuitMap';
import type { ErgastRace } from '@/types/f1';

interface Props {
  races: ErgastRace[];
}

export function CalendarClient({ races }: Props) {
  const [selected, setSelected] = useState<ErgastRace | null>(null);
  const now = new Date();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">2025 Calendar</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Race list */}
        <div className="space-y-2 lg:col-span-1 overflow-y-auto max-h-[70vh]">
          {races.map((race) => {
            const raceDate = new Date(race.date);
            const isPast = raceDate < now;
            const isNext = !isPast && races.find(r => new Date(r.date) >= now) === race;

            return (
              <button
                key={race.round}
                onClick={() => setSelected(race)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                  selected?.round === race.round
                    ? 'border-accent-red bg-surface-2'
                    : 'border-[#2c2c2e] bg-surface hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isPast ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {race.raceName}
                    </p>
                    <p className="text-xs text-text-secondary">{race.date}</p>
                  </div>
                  {isNext && (
                    <span className="text-xs bg-accent-red text-white px-2 py-0.5 rounded-full">
                      Next
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Map */}
        <div className="lg:col-span-2 h-[70vh] rounded-2xl overflow-hidden border border-[#2c2c2e]">
          <CircuitMap
            races={races}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      </div>
    </div>
  );
}
