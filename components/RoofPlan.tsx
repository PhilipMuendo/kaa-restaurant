"use client";

import { TABLES, type Table } from "@/config/site";
import { fits, taken, type ZoneId } from "@/lib/booking";

/*
 * The roof, drawn from above: the hearth and its counter at the centre, the
 * edge tables on the west parapet, the fire pit, the chef's table behind
 * glass. With a party, day and time chosen, every table shows whether it's
 * free; pick one directly.
 */

type Props = {
  date: string | null;
  time: string | null;
  party: number;
  zone: ZoneId | null;
  picked: string[];
  onPick: (zone: ZoneId, table: string) => void;
};

const INK = "#120E0C";

function shapeOf(t: Table) {
  if (t.shape === "stool") return { w: 20, h: 20, round: true };
  if (t.shape === "round") return { w: t.seats > 2 ? 44 : 34, h: t.seats > 2 ? 44 : 34, round: true };
  if (t.shape === "sofa") return { w: t.seats > 6 ? 110 : t.seats > 4 ? 96 : 70, h: 24, round: false };
  if (t.shape === "long") return { w: 150, h: 36, round: false };
  return { w: t.seats > 4 ? 44 : t.seats > 2 ? 44 : 34, h: t.seats > 4 ? 64 : t.seats > 2 ? 44 : 34, round: false };
}

export default function RoofPlan({ date, time, party, zone, picked, onPick }: Props) {
  const live = !!(date && time);
  return (
    <svg viewBox="0 0 1000 660" className="h-auto w-full select-none" role="group" aria-label="Plan of the roof. Free tables can be chosen.">
      <defs>
        <pattern id="taken" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="1.2" strokeOpacity="0.28" />
        </pattern>
        <radialGradient id="hearth-glow">
          <stop offset="0" stopColor="#FF6B2C" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FF6B2C" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* slab + parapet */}
      <rect x="40" y="40" width="920" height="580" fill="none" stroke={INK} strokeWidth="3" />
      <rect x="50" y="50" width="900" height="560" fill="none" stroke={INK} strokeWidth="0.8" strokeOpacity="0.5" />
      <text x="26" y="330" transform="rotate(-90 26 330)" textAnchor="middle" className="font-mono" fontSize="11" fill={INK} fillOpacity="0.6" letterSpacing="2">
        WEST · SUNSET
      </text>
      <text x="500" y="644" textAnchor="middle" className="font-mono" fontSize="11" fill={INK} fillOpacity="0.6" letterSpacing="2">
        SOUTH-EAST · CITY LIGHTS
      </text>
      <g transform="translate(978 70)" aria-hidden="true">
        <path d="M0 -18 L6 6 L0 2 L-6 6 Z" fill={INK} />
        <text y="22" textAnchor="middle" className="font-mono" fontSize="10" fill={INK}>
          N
        </text>
      </g>

      {/* lift + entrance */}
      <rect x="240" y="50" width="90" height="70" fill={INK} fillOpacity="0.06" stroke={INK} strokeOpacity="0.5" />
      <text x="285" y="90" textAnchor="middle" className="font-mono" fontSize="10" fill={INK} fillOpacity="0.6">
        LIFT
      </text>

      {/* the hearth: grill, oven, pit */}
      <ellipse cx="560" cy="180" rx="210" ry="110" fill="url(#hearth-glow)" />
      <rect x="440" y="100" width="240" height="120" fill="none" stroke={INK} strokeWidth="1.5" />
      <rect x="462" y="150" width="96" height="26" fill="#FF6B2C" fillOpacity="0.85" />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={466 + i * 11} x2={466 + i * 11} y1="150" y2="176" stroke={INK} strokeOpacity="0.45" />
      ))}
      <circle cx="622" cy="150" r="24" fill="none" stroke={INK} strokeWidth="1.5" />
      <circle cx="622" cy="150" r="12" fill="#FF6B2C" fillOpacity="0.7" />
      <rect x="590" y="186" width="70" height="22" fill={INK} fillOpacity="0.75" />
      <text x="560" y="124" textAnchor="middle" className="font-mono" fontSize="10" fill={INK} fillOpacity="0.7" letterSpacing="1.5">
        THE HEARTH
      </text>
      <text x="510" y="196" textAnchor="middle" className="font-mono" fontSize="8.5" fill={INK} fillOpacity="0.55">
        GRILL
      </text>
      <text x="622" y="184" textAnchor="middle" className="font-mono" fontSize="8.5" fill={INK} fillOpacity="0.55">
        OVEN
      </text>
      <text x="625" y="200" textAnchor="middle" className="font-mono" fontSize="8.5" fill="#ECE4D8">
        PIT
      </text>
      {/* the counter */}
      <path d="M415 310 A165 125 0 0 0 705 310" fill="none" stroke={INK} strokeWidth="14" strokeOpacity="0.85" strokeLinecap="round" />

      {/* fire pit */}
      <circle cx="808" cy="535" r="30" fill="#FF6B2C" fillOpacity="0.25" stroke={INK} strokeWidth="1.5" />
      <circle cx="808" cy="535" r="14" fill="#FF6B2C" fillOpacity="0.75" />

      {/* chef's table room */}
      <rect x="765" y="70" width="175" height="160" fill="none" stroke={INK} strokeWidth="1.2" strokeDasharray="6 4" />
      <text x="852" y="92" textAnchor="middle" className="font-mono" fontSize="9" fill={INK} fillOpacity="0.6" letterSpacing="1.5">
        CHEF&apos;S TABLE
      </text>

      {/* bar */}
      <rect x="470" y="565" width="230" height="30" fill={INK} fillOpacity="0.85" />
      <text x="585" y="584" textAnchor="middle" className="font-mono" fontSize="10" fill="#ECE4D8" letterSpacing="1.5">
        BAR · WALK-INS
      </text>

      {/* planters */}
      {[150, 420, 700].map((x) => (
        <circle key={x} cx={x} cy="64" r="9" fill="none" stroke={INK} strokeOpacity="0.3" />
      ))}

      {/* tables */}
      {TABLES.map((t) => {
        const s = shapeOf(t);
        const fit = fits(t, party);
        const isTaken = live && taken(t, date!, time!);
        const free = live && fit && !isTaken;
        const sel = picked.includes(t.id);
        const inZone = zone === t.zone;
        const fill = sel ? "#FF6B2C" : !live ? "#ECE4D8" : isTaken ? "url(#taken)" : free ? INK : "#ECE4D8";
        const op = !live ? 1 : fit ? 1 : 0.3;
        const label = `${t.id}, ${t.seats === 1 ? "counter seat" : `${t.seats} seats`}, ${!live ? "choose a day and time" : !fit ? "not for this party size" : isTaken ? "taken" : sel ? "selected" : "free"}`;
        const common = {
          fill,
          stroke: sel ? "#FF6B2C" : INK,
          strokeWidth: inZone ? 2 : 1.2,
          opacity: op,
        };
        const transform = t.shape === "sofa" && t.r ? `rotate(${t.r} ${t.x} ${t.y})` : undefined;
        return (
          <g
            key={t.id}
            role="button"
            tabIndex={free ? 0 : -1}
            aria-label={label}
            aria-pressed={sel}
            aria-disabled={!free}
            className={free ? "cursor-pointer outline-none [&:focus-visible>*:first-child]:stroke-[#FF6B2C] [&:focus-visible>*:first-child]:stroke-[3]" : ""}
            onClick={() => free && onPick(t.zone, t.id)}
            onKeyDown={(e) => {
              if (free && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onPick(t.zone, t.id);
              }
            }}
          >
            {s.round ? <circle cx={t.x} cy={t.y} r={s.w / 2} {...common} /> : <rect x={t.x - s.w / 2} y={t.y - s.h / 2} width={s.w} height={s.h} rx={t.shape === "sofa" ? 10 : 2} transform={transform} {...common} />}
            {sel && <circle cx={t.x} cy={t.y} r={s.round ? s.w / 2 + 7 : Math.max(s.w, s.h) / 2 + 8} fill="none" stroke="#FF6B2C" strokeOpacity="0.45" strokeWidth="2" />}
            {t.shape !== "stool" && (
              <text x={t.x} y={t.y + 3.5} textAnchor="middle" className="pointer-events-none font-mono" fontSize="9.5" fill={free && !sel ? "#ECE4D8" : INK} fillOpacity={op}>
                {t.id}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
