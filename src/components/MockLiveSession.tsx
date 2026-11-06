'use client';

import { useEffect, useRef, useState } from 'react';

// --- Driver data (2025 grid) ---

const TEAM_COLORS: Record<string, string> = {
  'Red Bull Racing': '#3671C6',
  'Ferrari':         '#E8002D',
  'Mercedes':        '#27F4D2',
  'McLaren':         '#FF8000',
  'Aston Martin':    '#229971',
  'Alpine':          '#FF87BC',
  'Williams':        '#64C4FF',
  'Racing Bulls':    '#6692FF',
  'Audi':            '#52E252',
  'Haas':            '#B6BABD',
};

const DRIVERS = [
  { number: 1,  acronym: 'VER', surname: 'Verstappen', team: 'Red Bull Racing' },
  { number: 4,  acronym: 'NOR', surname: 'Norris',     team: 'McLaren' },
  { number: 44, acronym: 'HAM', surname: 'Hamilton',   team: 'Ferrari' },
  { number: 16, acronym: 'LEC', surname: 'Leclerc',    team: 'Ferrari' },
  { number: 63, acronym: 'RUS', surname: 'Russell',    team: 'Mercedes' },
  { number: 81, acronym: 'PIA', surname: 'Piastri',    team: 'McLaren' },
  { number: 14, acronym: 'ALO', surname: 'Alonso',     team: 'Aston Martin' },
  { number: 30, acronym: 'LAW', surname: 'Lawson',     team: 'Red Bull Racing' },
  { number: 12, acronym: 'ANT', surname: 'Antonelli',  team: 'Mercedes' },
  { number: 55, acronym: 'SAI', surname: 'Sainz',      team: 'Williams' },
  { number: 18, acronym: 'STR', surname: 'Stroll',     team: 'Aston Martin' },
  { number: 10, acronym: 'GAS', surname: 'Gasly',      team: 'Alpine' },
  { number: 23, acronym: 'ALB', surname: 'Albon',      team: 'Williams' },
  { number: 22, acronym: 'TSU', surname: 'Tsunoda',    team: 'Racing Bulls' },
  { number: 27, acronym: 'HUL', surname: 'Hülkenberg', team: 'Audi' },
  { number: 5,  acronym: 'DOO', surname: 'Doohan',     team: 'Alpine' },
  { number: 6,  acronym: 'HAD', surname: 'Hadjar',     team: 'Racing Bulls' },
  { number: 98, acronym: 'BOR', surname: 'Bortoleto',  team: 'Audi' },
  { number: 31, acronym: 'OCO', surname: 'Ocon',       team: 'Haas' },
  { number: 38, acronym: 'BEA', surname: 'Bearman',    team: 'Haas' },
];

// --- Circuit (Interlagos-inspired) using Catmull-Rom spline ---

const WAYPOINTS = [
  { x: 0.52, y: 0.09 },
  { x: 0.63, y: 0.09 },
  { x: 0.74, y: 0.12 },
  { x: 0.83, y: 0.21 },
  { x: 0.85, y: 0.33 },
  { x: 0.80, y: 0.44 },
  { x: 0.68, y: 0.53 },
  { x: 0.54, y: 0.60 },
  { x: 0.41, y: 0.68 },
  { x: 0.26, y: 0.78 },
  { x: 0.14, y: 0.75 },
  { x: 0.11, y: 0.63 },
  { x: 0.14, y: 0.52 },
  { x: 0.24, y: 0.43 },
  { x: 0.33, y: 0.34 },
  { x: 0.30, y: 0.24 },
  { x: 0.26, y: 0.16 },
  { x: 0.32, y: 0.10 },
  { x: 0.42, y: 0.09 },
];

function cr(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
) {
  const t2 = t * t, t3 = t2 * t;
  return {
    x: 0.5 * (2*p1.x + (-p0.x+p2.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*t2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
    y: 0.5 * (2*p1.y + (-p0.y+p2.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*t2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*t3),
  };
}

function buildCircuit(resolution = 500) {
  const n = WAYPOINTS.length;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = WAYPOINTS[(i - 1 + n) % n];
    const p1 = WAYPOINTS[i];
    const p2 = WAYPOINTS[(i + 1) % n];
    const p3 = WAYPOINTS[(i + 2) % n];
    const steps = Math.floor(resolution / n);
    for (let j = 0; j < steps; j++) pts.push(cr(p0, p1, p2, p3, j / steps));
  }
  return pts;
}

const CIRCUIT = buildCircuit();

// Drivers spread across first half of the lap so they're not bunched
const DRIVER_SPEEDS = DRIVERS.map((_, i) => 0.000310 - i * 0.000003);
const DRIVER_INIT   = DRIVERS.map((_, i) => (i / DRIVERS.length) * 0.55);

// ─── MockTrackMap ───────────────────────────────────────────────

export function MockTrackMap() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const posRef     = useRef<number[]>([...DRIVER_INIT]);
  const rafRef     = useRef<number>(0);
  const lastRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const delta = Math.min((now - lastRef.current) / 16.67, 4);
      lastRef.current = now;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Advance positions
      posRef.current = posRef.current.map((p, i) => (p + DRIVER_SPEEDS[i] * delta + 1) % 1);

      // Map normalized → canvas (with padding)
      const pad = 0.05;
      const toC = (pt: { x: number; y: number }) => ({
        cx: (pad + pt.x * (1 - pad * 2)) * W,
        cy: (pad + pt.y * (1 - pad * 2)) * H,
      });

      // Track base
      ctx.beginPath();
      const s0 = toC(CIRCUIT[0]);
      ctx.moveTo(s0.cx, s0.cy);
      for (const pt of CIRCUIT.slice(1)) { const c = toC(pt); ctx.lineTo(c.cx, c.cy); }
      ctx.closePath();
      ctx.strokeStyle = '#2c2c2e';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Track accent
      ctx.beginPath();
      ctx.moveTo(s0.cx, s0.cy);
      for (const pt of CIRCUIT.slice(1)) { const c = toC(pt); ctx.lineTo(c.cx, c.cy); }
      ctx.closePath();
      ctx.strokeStyle = '#48484a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Start/finish line
      const sf = toC(CIRCUIT[0]);
      const sfN = toC(CIRCUIT[8]);
      const angle = Math.atan2(sfN.cy - sf.cy, sfN.cx - sf.cx) + Math.PI / 2;
      ctx.save();
      ctx.translate(sf.cx, sf.cy);
      ctx.rotate(angle);
      ctx.fillStyle = '#f5f5f7';
      ctx.fillRect(-8, -1.5, 16, 3);
      ctx.restore();

      // Drivers
      for (let i = 0; i < DRIVERS.length; i++) {
        const idx = Math.floor(posRef.current[i] * CIRCUIT.length) % CIRCUIT.length;
        const { cx, cy } = toC(CIRCUIT[idx]);
        const color = TEAM_COLORS[DRIVERS[i].team] ?? '#86868b';

        // Glow
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 11);
        grd.addColorStop(0, color + '44');
        grd.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#0a0a0a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Acronym
        ctx.fillStyle = '#f5f5f7';
        ctx.font = 'bold 8px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(DRIVERS[i].acronym, cx, cy - 11);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="bg-surface border border-[#2c2c2e] rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[#2c2c2e] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Track Map</h2>
          <span className="text-[10px] font-semibold uppercase tracking-widest bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/30 px-1.5 py-0.5 rounded">Demo</span>
        </div>
        <span className="text-xs text-text-secondary">20 cars · simulated</span>
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={420}
        className="w-full h-auto block bg-[#0a0a0a]"
        style={{ aspectRatio: '700 / 420' }}
      />
    </div>
  );
}

// ─── MockTimingTower ─────────────────────────────────────────────

const BASE_LAP = 72_500; // ~1:12.5 baseline for Interlagos
const S1_BASE  = 24_000;
const S2_BASE  = 26_500;
const S3_BASE  = 22_000;

function fmtLap(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const h = String(ms % 1000).padStart(3, '0');
  return `${m}:${s}.${h}`;
}

function fmtGap(ms: number) {
  if (ms <= 0) return 'LEADER';
  if (ms < 60000) return `+${(ms / 1000).toFixed(3)}`;
  const m = Math.floor(ms / 60000);
  const s = ((ms % 60000) / 1000).toFixed(3).padStart(6, '0');
  return `+${m}:${s}`;
}

function fmtSector(ms: number) {
  return (ms / 1000).toFixed(3);
}

interface Row {
  pos: number;
  driver: (typeof DRIVERS)[0];
  lapProgress: number; // 0–1 position in current lap
  bestLapMs: number;
  lastLapMs: number;
  gapMs: number;
  activeSector: 1 | 2 | 3 | null;
  sectorMs: number | null;
  flash: boolean;
}

function buildRows(): Row[] {
  const bests = DRIVERS.map((_, i) => BASE_LAP + i * 220 + Math.round(Math.random() * 300 - 150));
  return DRIVERS.map((driver, i) => ({
    pos: i + 1,
    driver,
    lapProgress: Math.random(),
    bestLapMs: bests[i],
    lastLapMs: bests[i] + Math.round(Math.random() * 600),
    gapMs: i === 0 ? 0 : bests[i] - bests[0],
    activeSector: null,
    sectorMs: null,
    flash: false,
  }));
}

export function MockTimingTower() {
  const [rows, setRows] = useState<Row[]>(buildRows);

  useEffect(() => {
    const tick = setInterval(() => {
      setRows(prev => {
        const next = prev.map(row => {
          const speed = 0.012 - row.pos * 0.0003; // leader advances fastest
          const newProgress = row.lapProgress + speed;

          if (newProgress >= 1) {
            // Complete a lap
            const variation = Math.round(Math.random() * 1000 - 100);
            const newLap = row.bestLapMs + variation + row.pos * 60;
            const newBest = newLap < row.bestLapMs ? newLap : row.bestLapMs;
            return {
              ...row,
              lapProgress: newProgress % 1,
              lastLapMs: newLap,
              bestLapMs: newBest,
              activeSector: null,
              sectorMs: null,
              flash: true,
            };
          }

          // Update active sector display
          let activeSector: 1 | 2 | 3 | null = null;
          let sectorMs: number | null = null;

          if (newProgress < 0.33) {
            activeSector = 1;
            sectorMs = Math.round(S1_BASE + row.pos * 60 + Math.random() * 100 - 50);
          } else if (newProgress < 0.66) {
            activeSector = 2;
            sectorMs = Math.round(S2_BASE + row.pos * 65 + Math.random() * 100 - 50);
          } else {
            activeSector = 3;
            sectorMs = Math.round(S3_BASE + row.pos * 55 + Math.random() * 100 - 50);
          }

          const crossed =
            (row.lapProgress < 0.33 && newProgress >= 0.33) ||
            (row.lapProgress < 0.66 && newProgress >= 0.66);

          return {
            ...row,
            lapProgress: newProgress,
            activeSector,
            sectorMs,
            flash: crossed,
          };
        });

        // Clear flash after 400ms
        setTimeout(() => setRows(r => r.map(x => ({ ...x, flash: false }))), 400);
        return next;
      });
    }, 1200);

    return () => clearInterval(tick);
  }, []);

  return (
    <div className="bg-surface border border-[#2c2c2e] rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[#2c2c2e] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Live Timing</h2>
          <span className="text-[10px] font-semibold uppercase tracking-widest bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/30 px-1.5 py-0.5 rounded">Demo</span>
        </div>
        <span className="text-xs text-text-secondary">Brazil GP · Practice 1</span>
      </div>

      {/* Column headers */}
      <div className="hidden md:grid grid-cols-[2.5rem_2.5rem_1fr_5.5rem_6.5rem_6.5rem_6.5rem] gap-x-2 px-4 py-2 border-b border-[#1c1c1e]">
        {['Pos', '', 'Driver', 'Sector', 'Gap', 'Last Lap', 'Best Lap'].map(h => (
          <span key={h} className="text-[10px] text-text-secondary uppercase tracking-widest text-right first:text-left [&:nth-child(3)]:text-left">{h}</span>
        ))}
      </div>

      <div className="divide-y divide-[#1a1a1a]">
        {rows.map((row) => {
          const color = TEAM_COLORS[row.driver.team] ?? '#86868b';
          return (
            <div
              key={row.driver.number}
              className={`flex md:grid md:grid-cols-[2.5rem_2.5rem_1fr_5.5rem_6.5rem_6.5rem_6.5rem] gap-x-2 px-4 py-2.5 items-center transition-colors duration-300 ${row.flash ? 'bg-white/[0.04]' : 'hover:bg-[#1a1a1a]'}`}
            >
              {/* Pos */}
              <span className="text-sm font-mono text-text-secondary w-6 md:w-auto">{row.pos}</span>

              {/* Team bar */}
              <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />

              {/* Driver */}
              <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
                <span className="text-sm font-semibold font-mono">{row.driver.acronym}</span>
                <span className="text-xs text-text-secondary truncate hidden sm:inline">{row.driver.surname}</span>
                {row.activeSector !== null && row.sectorMs !== null && (
                  <span className="text-[10px] text-text-secondary ml-1 hidden lg:inline">
                    S{row.activeSector} {fmtSector(row.sectorMs)}
                  </span>
                )}
              </div>

              {/* Sector (desktop only) */}
              <div className="text-right hidden md:block">
                {row.activeSector !== null && row.sectorMs !== null ? (
                  <span className={`text-xs font-mono ${row.flash ? 'text-[#f5f5f7]' : 'text-text-secondary'}`}>
                    S{row.activeSector} {fmtSector(row.sectorMs)}
                  </span>
                ) : (
                  <span className="text-xs text-text-secondary">—</span>
                )}
              </div>

              {/* Gap */}
              <span
                className={`text-xs font-mono text-right ${row.pos === 1 ? 'text-[#e8002d] font-semibold' : 'text-text-secondary'}`}
              >
                {fmtGap(row.gapMs)}
              </span>

              {/* Last lap */}
              <span className={`text-xs font-mono text-right transition-colors ${row.flash ? 'text-[#f5f5f7]' : 'text-text-secondary'}`}>
                {fmtLap(row.lastLapMs)}
              </span>

              {/* Best lap */}
              <span className="text-xs font-mono text-right text-green-400">
                {fmtLap(row.bestLapMs)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MockLiveSession (wrapper) ────────────────────────────────────

interface MockLiveSessionProps {
  onExit: () => void;
  nextSessionStart?: string;
}

export function MockLiveSession({ onExit, nextSessionStart }: MockLiveSessionProps) {
  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#0071e3]/5 border border-[#0071e3]/20 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0071e3] opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0071e3]" />
          </span>
          <p className="text-sm text-text-secondary">
            Demo mode · Simulating{' '}
            <span className="text-[#f5f5f7] font-medium">Brazil GP · Practice 1</span>
            {nextSessionStart && (
              <span className="ml-1">
                · Live starts{' '}
                {new Date(nextSessionStart).toLocaleString(undefined, {
                  weekday: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
                })}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onExit}
          className="text-xs text-text-secondary hover:text-[#f5f5f7] transition-colors flex-shrink-0"
        >
          ✕ Exit demo
        </button>
      </div>

      <MockTrackMap />
      <MockTimingTower />
    </div>
  );
}
