export interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  circuit_key: number;
  circuit_short_name: string;
  country_name: string;
  country_code: string;
  year: number;
  meeting_name: string;
}

export interface Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  country_code: string;
  headshot_url?: string;
}

export interface Position {
  driver_number: number;
  position: number;
  date: string;
  session_key: number;
}

export interface Lap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
  date_start: string;
  lap_start_time: string;
  is_pit_out_lap: boolean;
  session_key: number;
}

export interface CarData {
  driver_number: number;
  date: string;
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: boolean;
  drs: number;
}

export interface Location {
  driver_number: number;
  date: string;
  x: number;
  y: number;
  z: number;
  session_key: number;
}

export interface TeamRadio {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  date: string;
  recording_url: string;
}

export interface RaceControlMessage {
  session_key: number;
  meeting_key: number;
  date: string;
  lap_number?: number;
  category: string;
  flag?: string;
  scope?: string;
  message: string;
}

// Jolpica / Ergast types
export interface ErgastRace {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
}

export interface ErgastDriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    givenName: string;
    familyName: string;
    nationality: string;
    code?: string;
  };
  Constructors: Array<{ constructorId: string; name: string }>;
}

export interface ErgastConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
}
