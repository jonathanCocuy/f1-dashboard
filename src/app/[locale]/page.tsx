import { fetchJolpica, fetchOpenF1 } from '@/lib/api';
import { CountdownTimer } from '@/components/CountdownTimer';
import type { ErgastRace, ErgastDriverStanding, ErgastConstructorStanding, Session } from '@/types/f1';
import { TEAM_COLORS } from '@/lib/constants';

async function getNextRace(): Promise<ErgastRace | null> {
  try {
    const data = await fetchJolpica<any>('/current.json');
    const races: ErgastRace[] = data.MRData.RaceTable.Races;
    const now = new Date();
    return races.find(r => new Date(`${r.date}T${r.time ?? '00:00:00'}`) > now) ?? null;
  } catch {
    return null;
  }
}

async function getNextPractice(): Promise<Session | null> {
  try {
    const year = new Date().getFullYear();
    const sessions: Session[] = await fetchOpenF1(`/sessions?year=${year}&session_type=Practice`);
    const now = new Date();
    const upcoming = sessions
      .filter(s => new Date(s.date_start) > now)
      .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
    return upcoming[0] ?? null;
  } catch {
    return null;
  }
}

async function getDriverStandings(): Promise<ErgastDriverStanding[]> {
  try {
    const data = await fetchJolpica<any>('/current/driverStandings.json');
    return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
  } catch {
    return [];
  }
}

async function getConstructorStandings(): Promise<ErgastConstructorStanding[]> {
  try {
    const data = await fetchJolpica<any>('/current/constructorStandings.json');
    return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [nextRace, nextPractice, drivers, constructors] = await Promise.all([
    getNextRace(),
    getNextPractice(),
    getDriverStandings(),
    getConstructorStandings(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Countdown grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nextRace && (
          <section className="bg-surface border border-[#2c2c2e] rounded-2xl overflow-hidden">
            <div className="h-[3px] bg-accent-red" />
            <div className="p-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-red">
                Next Race
              </span>
              <h2 className="text-xl font-semibold mt-2 mb-0.5">{nextRace.raceName}</h2>
              <p className="text-text-secondary text-sm mb-6">
                {nextRace.Circuit.Location.locality}, {nextRace.Circuit.Location.country}
              </p>
              <CountdownTimer targetDate={`${nextRace.date}T${nextRace.time ?? '14:00:00'}`} large />
              <p className="text-xs text-text-secondary mt-5">
                {new Date(`${nextRace.date}T${nextRace.time ?? '14:00:00'}`).toLocaleString(
                  undefined,
                  { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }
                )}
              </p>
            </div>
          </section>
        )}

        {nextPractice && (
          <section className="bg-surface border border-[#2c2c2e] rounded-2xl overflow-hidden">
            <div className="h-[3px] bg-accent-blue" />
            <div className="p-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-blue">
                Next Practice
              </span>
              <h2 className="text-xl font-semibold mt-2 mb-0.5">{nextPractice.session_name}</h2>
              <p className="text-text-secondary text-sm mb-6">
                {nextPractice.circuit_short_name}, {nextPractice.country_name}
              </p>
              <CountdownTimer targetDate={nextPractice.date_start} large />
              <p className="text-xs text-text-secondary mt-5">
                {new Date(nextPractice.date_start).toLocaleString(undefined, {
                  weekday: 'short', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
                })}
              </p>
            </div>
          </section>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver Standings Top 5 */}
        <section className="bg-surface border border-[#2c2c2e] rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Driver Standings</h3>
          <div className="space-y-3">
            {drivers.slice(0, 5).map((d) => {
              const teamColor = TEAM_COLORS[d.Constructors[0]?.name] ?? '#86868b';
              return (
                <div key={d.Driver.driverId} className="flex items-center gap-3">
                  <span className="text-text-secondary w-4 text-sm font-mono">{d.position}</span>
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: teamColor }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {d.Driver.givenName} {d.Driver.familyName}
                    </p>
                    <p className="text-xs text-text-secondary">{d.Constructors[0]?.name}</p>
                  </div>
                  <span className="font-mono text-sm font-semibold">{d.points}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Constructor Standings Top 5 */}
        <section className="bg-surface border border-[#2c2c2e] rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Constructor Standings</h3>
          <div className="space-y-3">
            {constructors.slice(0, 5).map((c) => {
              const teamColor = TEAM_COLORS[c.Constructor.name] ?? '#86868b';
              return (
                <div key={c.Constructor.constructorId} className="flex items-center gap-3">
                  <span className="text-text-secondary w-4 text-sm font-mono">{c.position}</span>
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: teamColor }} />
                  <p className="flex-1 text-sm font-medium">{c.Constructor.name}</p>
                  <span className="font-mono text-sm font-semibold">{c.points}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
