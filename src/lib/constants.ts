export const OPENF1_BASE = 'https://api.openf1.org/v1';
export const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';

export const TEAM_COLORS: Record<string, string> = {
  'Red Bull Racing': '#3671C6',
  'Ferrari':         '#E8002D',
  'McLaren':         '#FF8000',
  'Mercedes':        '#27F4D2',
  'Aston Martin':    '#229971',
  'Alpine':          '#FF87BC',
  'Williams':        '#64C4FF',
  'RB':              '#6692FF',
  'Kick Sauber':     '#52E252',
  'Haas':            '#B6BABD',
  'Cadillac':        '#FFFFFF',
  'Audi':            '#D4AF37',
};

export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
