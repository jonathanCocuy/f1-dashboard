'use client';

import { useEffect, useState } from 'react';

interface Props {
  targetDate: string;
  large?: boolean;
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownTimer({ targetDate, large = false }: Props) {
  const target = new Date(targetDate);
  const [time, setTime] = useState(getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hrs', value: time.hours },
    { label: 'Min', value: time.minutes },
    { label: 'Sec', value: time.seconds },
  ];

  if (large) {
    return (
      <div className="flex gap-3">
        {units.map(({ label, value }, i) => (
          <div key={label} className="flex items-start gap-3">
            <div className="text-center min-w-[52px]">
              <p className="text-5xl font-semibold font-mono tabular-nums leading-none tracking-tight">
                {String(value).padStart(2, '0')}
              </p>
              <p className="text-[11px] text-text-secondary uppercase tracking-widest mt-2">{label}</p>
            </div>
            {i < units.length - 1 && (
              <span className="text-3xl font-mono text-[#2c2c2e] leading-none mt-1" aria-hidden>:</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {units.map(({ label, value }) => (
        <div key={label} className="text-center">
          <p className="text-3xl font-semibold font-mono tabular-nums">
            {String(value).padStart(2, '0')}
          </p>
          <p className="text-xs text-text-secondary mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
