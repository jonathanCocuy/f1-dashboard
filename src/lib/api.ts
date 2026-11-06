import { OPENF1_BASE, JOLPICA_BASE } from './constants';

export async function fetchOpenF1<T>(path: string): Promise<T> {
  const res = await fetch(`${OPENF1_BASE}${path}`, { next: { revalidate: 5 } });
  if (!res.ok) throw new Error(`OpenF1 error: ${res.status}`);
  return res.json();
}

export async function fetchJolpica<T>(path: string): Promise<T> {
  const res = await fetch(`${JOLPICA_BASE}${path}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Jolpica error: ${res.status}`);
  return res.json();
}
