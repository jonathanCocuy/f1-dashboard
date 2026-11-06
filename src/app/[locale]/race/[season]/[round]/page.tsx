import { fetchJolpica } from '@/lib/api';

interface Props {
  params: Promise<{ season: string; round: string }>;
}

export default async function RacePage({ params }: Props) {
  const { season, round } = await params;
  let results: any[] = [];
  let raceName = '';

  try {
    const data = await fetchJolpica<any>(`/${season}/${round}/results.json`);
    const race = data.MRData.RaceTable.Races[0];
    results = race?.Results ?? [];
    raceName = race?.raceName ?? '';
  } catch {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">{raceName || `Round ${round}, ${season}`}</h1>
      <div className="bg-surface border border-[#2c2c2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2c2c2e]">
              <th className="text-left p-4 text-xs text-text-secondary font-medium uppercase">Pos</th>
              <th className="text-left p-4 text-xs text-text-secondary font-medium uppercase">Driver</th>
              <th className="text-left p-4 text-xs text-text-secondary font-medium uppercase hidden md:table-cell">Team</th>
              <th className="text-right p-4 text-xs text-text-secondary font-medium uppercase">Pts</th>
              <th className="text-right p-4 text-xs text-text-secondary font-medium uppercase hidden md:table-cell">Time</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r: any) => (
              <tr key={r.position} className="border-b border-[#2c2c2e] last:border-0 hover:bg-surface-2 transition-colors">
                <td className="p-4 font-mono text-sm text-text-secondary">{r.position}</td>
                <td className="p-4 text-sm font-medium">{r.Driver.givenName} {r.Driver.familyName}</td>
                <td className="p-4 text-sm text-text-secondary hidden md:table-cell">{r.Constructor.name}</td>
                <td className="p-4 text-right font-mono text-sm font-semibold">{r.points}</td>
                <td className="p-4 text-right font-mono text-sm text-text-secondary hidden md:table-cell">
                  {r.Time?.time ?? r.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
