'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchOpenF1 } from '@/lib/api';
import { TimingTower } from '@/components/TimingTower';
import { LiveTrackMap } from '@/components/LiveTrackMap';
import { MockLiveSession } from '@/components/MockLiveSession';
import { SessionBadge } from '@/components/SessionBadge';
import { CountdownTimer } from '@/components/CountdownTimer';
import type { Session } from '@/types/f1';

function findActiveOrNext(sessions: Session[]): { session: Session; isLive: boolean } | null {
  if (!sessions.length) return null;
  const now = new Date();
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
  );

  // prefer currently active
  const active = sorted.find(
    (s) => new Date(s.date_start) <= now && now <= new Date(s.date_end)
  );
  if (active) return { session: active, isLive: true };

  // next upcoming
  const next = sorted.find((s) => new Date(s.date_start) > now);
  if (next) return { session: next, isLive: false };

  // most recent past session
  return { session: sorted[sorted.length - 1], isLive: false };
}

export default function LivePage() {
  const year = new Date().getFullYear();
  const [showDemo, setShowDemo] = useState(false);

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ['sessions', year],
    queryFn: () => fetchOpenF1(`/sessions?year=${year}`),
    refetchInterval: 30000,
  });

  const result = sessions ? findActiveOrNext(sessions) : null;
  const session = result?.session ?? null;
  const isLive = result?.isLive ?? false;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-text-secondary">Loading session data…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {session ? (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <SessionBadge type={session.session_name} isLive={isLive} />
            <h1 className="text-2xl font-semibold">{session.meeting_name ?? 'Grand Prix'}</h1>
          </div>
          <p className="text-text-secondary -mt-4">
            {session.circuit_short_name} · {session.country_name}
          </p>

          {isLive ? (
            <div className="space-y-6">
              <LiveTrackMap sessionKey={session.session_key} />
              <TimingTower sessionKey={session.session_key} />
            </div>
          ) : showDemo ? (
            <MockLiveSession
              onExit={() => setShowDemo(false)}
              nextSessionStart={session.date_start}
            />
          ) : (
            <>
              <div className="bg-surface border border-[#2c2c2e] rounded-2xl p-6 space-y-4">
                <div>
                  <p className="text-text-secondary text-sm mb-1">Next session</p>
                  <p className="font-semibold text-lg">{session.session_name}</p>
                  <p className="text-text-secondary text-sm">
                    {new Date(session.date_start).toLocaleString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short',
                    })}
                  </p>
                </div>
                <CountdownTimer targetDate={session.date_start} />
              </div>

              {/* Demo mode button */}
              <button
                onClick={() => setShowDemo(true)}
                className="w-full flex items-center justify-between gap-3 bg-surface border border-[#2c2c2e] hover:border-[#0071e3]/40 hover:bg-[#0071e3]/5 rounded-2xl px-5 py-4 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] flex-shrink-0">
                    ▶
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium group-hover:text-[#f5f5f7] transition-colors">Watch Demo</p>
                    <p className="text-xs text-text-secondary">Animated track map &amp; live timing simulation</p>
                  </div>
                </div>
                <span className="text-text-secondary text-xs bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/30 px-2 py-0.5 rounded font-medium flex-shrink-0">
                  Preview
                </span>
              </button>

              {/* Upcoming sessions list */}
              {sessions && (
                <UpcomingSessions sessions={sessions} currentKey={session.session_key} />
              )}
            </>
          )}
        </>
      ) : (
        <div className="bg-surface border border-[#2c2c2e] rounded-2xl p-12 text-center">
          <p className="text-text-secondary text-lg">No session data available</p>
        </div>
      )}
    </div>
  );
}

function UpcomingSessions({
  sessions,
  currentKey,
}: {
  sessions: Session[];
  currentKey: number;
}) {
  const now = new Date();
  const upcoming = sessions
    .filter((s) => new Date(s.date_start) > now && s.session_key !== currentKey)
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())
    .slice(0, 4);

  if (!upcoming.length) return null;

  return (
    <section className="bg-surface border border-[#2c2c2e] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Coming up
      </h3>
      <div className="space-y-3">
        {upcoming.map((s) => (
          <div key={s.session_key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{s.session_name}</p>
              <p className="text-xs text-text-secondary">
                {new Date(s.date_start).toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span className="text-xs text-text-secondary bg-surface-2 border border-[#2c2c2e] px-2 py-0.5 rounded-full">
              {s.session_type}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
