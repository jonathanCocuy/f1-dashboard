'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { fetchOpenF1 } from '@/lib/api';
import { TEAM_COLORS } from '@/lib/constants';
import type { Driver, Location } from '@/types/f1';

interface Props {
  sessionKey: number;
}

interface DriverPosition {
  driverNumber: number;
  x: number;
  y: number;
  teamName: string;
  acronym: string;
}

function normalize(
  positions: { x: number; y: number }[],
  width: number,
  height: number,
  padding: number
) {
  if (!positions.length) return { scale: 1, offsetX: 0, offsetY: 0 };
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scale = Math.min(
    (width - padding * 2) / rangeX,
    (height - padding * 2) / rangeY
  );
  return { scale, minX, minY, rangeX, rangeY, offsetX: padding, offsetY: padding };
}

export function LiveTrackMap({ sessionKey }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ['drivers', sessionKey],
    queryFn: () => fetchOpenF1(`/drivers?session_key=${sessionKey}`),
    staleTime: 60000,
  });

  // Get latest position per driver (most recent 60s of data)
  const { data: locations } = useQuery<Location[]>({
    queryKey: ['location', sessionKey],
    queryFn: () => fetchOpenF1(`/location?session_key=${sessionKey}&date>${new Date(Date.now() - 10000).toISOString()}`),
    refetchInterval: 5000,
  });

  // Track outline: wider window to get the full layout
  const { data: trackOutline } = useQuery<Location[]>({
    queryKey: ['track-outline', sessionKey],
    queryFn: () => fetchOpenF1(`/location?session_key=${sessionKey}&driver_number=1`),
    staleTime: Infinity,
  });

  const driverMap = new Map(drivers?.map((d) => [d.driver_number, d]) ?? []);

  // Latest position per driver from recent data
  const latestPositions = new Map<number, Location>();
  if (locations) {
    for (const loc of locations) {
      const existing = latestPositions.get(loc.driver_number);
      if (!existing || loc.date > existing.date) {
        latestPositions.set(loc.driver_number, loc);
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Collect all points for normalization reference
    const allPoints: { x: number; y: number }[] = [
      ...(trackOutline ?? []).map((l) => ({ x: l.x, y: l.y })),
      ...Array.from(latestPositions.values()).map((l) => ({ x: l.x, y: l.y })),
    ];

    if (!allPoints.length) {
      ctx.fillStyle = '#86868b';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for position data…', W / 2, H / 2);
      return;
    }

    const { scale, minX = 0, minY = 0, offsetX, offsetY } = normalize(allPoints, W, H, 32);

    const toCanvas = (x: number, y: number) => ({
      cx: (x - minX) * scale + offsetX,
      // y-axis is flipped in canvas vs track coords
      cy: H - ((y - minY) * scale + offsetY),
    });

    // Draw track outline
    if (trackOutline && trackOutline.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#2c2c2e';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const first = toCanvas(trackOutline[0].x, trackOutline[0].y);
      ctx.moveTo(first.cx, first.cy);
      for (const pt of trackOutline.slice(1)) {
        const { cx, cy } = toCanvas(pt.x, pt.y);
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Thin accent line on top
      ctx.beginPath();
      ctx.strokeStyle = '#3a3a3c';
      ctx.lineWidth = 2;
      const f2 = toCanvas(trackOutline[0].x, trackOutline[0].y);
      ctx.moveTo(f2.cx, f2.cy);
      for (const pt of trackOutline.slice(1)) {
        const { cx, cy } = toCanvas(pt.x, pt.y);
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // Draw driver dots
    for (const [driverNum, loc] of latestPositions) {
      const driver = driverMap.get(driverNum);
      const color = driver ? (TEAM_COLORS[driver.team_name] ?? '#86868b') : '#86868b';
      const { cx, cy } = toCanvas(loc.x, loc.y);

      // Glow
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fillStyle = color + '33';
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Acronym label
      if (driver) {
        ctx.fillStyle = '#f5f5f7';
        ctx.font = 'bold 8px Inter, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(driver.name_acronym, cx, cy - 10);
      }
    }
  }, [trackOutline, locations, driverMap]);

  return (
    <div className="bg-surface border border-[#2c2c2e] rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[#2c2c2e] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Track Map
        </h2>
        <span className="text-xs text-text-secondary">
          {latestPositions.size} cars · updates every 5s
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={420}
        className="w-full h-auto block bg-[#0a0a0a]"
        style={{ aspectRatio: '700/420' }}
      />
    </div>
  );
}
