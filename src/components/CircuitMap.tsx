'use client';

import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import type { ErgastRace } from '@/types/f1';

interface Props {
  races: ErgastRace[];
  selected: ErgastRace | null;
  onSelect: (race: ErgastRace) => void;
}

export function CircuitMap({ races, selected, onSelect }: Props) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

  return (
    <Map
      mapboxAccessToken={token}
      initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      {races.map((race) => (
        <Marker
          key={race.round}
          longitude={parseFloat(race.Circuit.Location.long)}
          latitude={parseFloat(race.Circuit.Location.lat)}
          anchor="bottom"
        >
          <button
            onClick={() => onSelect(race)}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${
              selected?.round === race.round
                ? 'bg-accent-red border-white scale-150'
                : 'bg-white/80 border-white/40 hover:scale-125'
            }`}
          />
        </Marker>
      ))}

      {selected && (
        <Popup
          longitude={parseFloat(selected.Circuit.Location.long)}
          latitude={parseFloat(selected.Circuit.Location.lat)}
          anchor="bottom"
          offset={16}
          closeButton={false}
          className="!bg-transparent"
        >
          <div className="bg-surface border border-[#2c2c2e] rounded-xl p-3 text-text-primary text-xs min-w-[140px]">
            <p className="font-semibold">{selected.raceName}</p>
            <p className="text-text-secondary mt-0.5">{selected.date}</p>
            <p className="text-text-secondary">{selected.Circuit.Location.country}</p>
          </div>
        </Popup>
      )}
    </Map>
  );
}
