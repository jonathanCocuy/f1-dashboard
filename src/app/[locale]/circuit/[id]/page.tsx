import { fetchJolpica } from '@/lib/api';
import type { ErgastRace } from '@/types/f1';

interface Props {
  params: Promise<{ id: string }>;
}

async function getCircuitInfo(id: string) {
  try {
    const data = await fetchJolpica<any>(`/circuits/${id}.json`);
    return data.MRData.CircuitTable.Circuits[0] ?? null;
  } catch {
    return null;
  }
}

async function getNextRaceAtCircuit(id: string): Promise<ErgastRace | null> {
  try {
    const data = await fetchJolpica<any>(`/current.json`);
    const races: ErgastRace[] = data.MRData.RaceTable.Races;
    const now = new Date();
    return (
      races.find(
        (r) => r.Circuit.circuitId === id && new Date(r.date) >= now
      ) ?? null
    );
  } catch {
    return null;
  }
}

export default async function CircuitPage({ params }: Props) {
  const { id } = await params;
  const [circuit, nextRace] = await Promise.all([
    getCircuitInfo(id),
    getNextRaceAtCircuit(id),
  ]);

  if (!circuit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-text-secondary">Circuit not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{circuit.circuitName}</h1>
        <p className="text-text-secondary mt-1">
          {circuit.Location.locality}, {circuit.Location.country}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Country', value: circuit.Location.country },
          { label: 'Locality', value: circuit.Location.locality },
          { label: 'Latitude', value: parseFloat(circuit.Location.lat).toFixed(4) },
          { label: 'Longitude', value: parseFloat(circuit.Location.long).toFixed(4) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-[#2c2c2e] rounded-2xl p-4">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">{label}</p>
            <p className="font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {nextRace && (
        <div className="bg-surface border border-[#2c2c2e] rounded-2xl p-6">
          <p className="text-text-secondary text-sm mb-1">Next race here</p>
          <p className="text-xl font-semibold">{nextRace.raceName}</p>
          <p className="text-text-secondary">{nextRace.date}</p>
        </div>
      )}
    </div>
  );
}
