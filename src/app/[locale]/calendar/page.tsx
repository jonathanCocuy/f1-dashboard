import { fetchJolpica } from '@/lib/api';
import { CalendarClient } from './CalendarClient';
import type { ErgastRace } from '@/types/f1';

async function getRaces(): Promise<ErgastRace[]> {
  try {
    const data = await fetchJolpica<any>('/current.json');
    return data.MRData.RaceTable.Races ?? [];
  } catch {
    return [];
  }
}

export default async function CalendarPage() {
  const races = await getRaces();
  return <CalendarClient races={races} />;
}
