"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { BOOKING, TABLES, ZONES, type Table, type Zone } from "@/config/site";
import { toMin } from "./time";

/*
 * One booking, shared by the whole page: the roof plan, the floating ticket,
 * the week ("book Friday") and private dining all read and write it.
 */

export type ZoneId = Zone["id"];
export type Draft = { party: number; date: string | null; time: string | null; zone: ZoneId | null; table: string | null };
export type Confirmed = Draft & { ref: string; name: string };

type Ctx = {
  draft: Draft;
  set: (p: Partial<Draft>) => void;
  done: Confirmed | null;
  setDone: (c: Confirmed | null) => void;
};

const BookCtx = createContext<Ctx | null>(null);
export const useBooking = () => {
  const c = useContext(BookCtx);
  if (!c) throw new Error("useBooking outside BookingProvider");
  return c;
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>({ party: 2, date: null, time: null, zone: null, table: null });
  const [done, setDone] = useState<Confirmed | null>(null);
  const set = useCallback((p: Partial<Draft>) => {
    setDraft((d) => {
      const n = { ...d, ...p };
      // anything upstream changing invalidates the chosen table
      if (("party" in p && p.party !== d.party) || ("date" in p && p.date !== d.date) || ("time" in p && p.time !== d.time) || ("zone" in p && p.zone !== d.zone)) {
        if (!("table" in p)) n.table = null;
      }
      return n;
    });
  }, []);
  const value = useMemo(() => ({ draft, set, done, setDone }), [draft, set, done]);
  return <BookCtx.Provider value={value}>{children}</BookCtx.Provider>;
}

// ── availability (demo) ───────────────────────────────────────────────────────
// Deterministic, so every visitor sees the same "busy" Friday. Replace with the
// reservation system's availability API before launch.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export function taken(table: Table, date: string, time: string) {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
  const m = toMin(time);
  let load = 0.12;
  if (m >= 19 * 60 && m <= 20 * 60 + 30) load += 0.32;
  else if (m >= 18 * 60) load += 0.18;
  if (dow === 5 || dow === 6) load += 0.22;
  if (table.zone === "edge" && m >= 17 * 60 + 30 && m <= 19 * 60) load += 0.15; // sunset tables go first
  return hash(`${table.id}|${date}|${time}`) < load;
}

/** Tables that suit the party: no 2 at a 6-top, counter handled as runs of stools. */
export function fits(table: Table, party: number) {
  if (table.zone === "counter") return party <= 4;
  if (table.zone === "chef") return party >= 6 && party <= table.seats;
  if (table.zone === "pit") return party <= table.seats;
  return party <= table.seats && table.seats - party <= 2;
}

/** Free runs of adjacent counter stools long enough for the party. */
export function stoolRuns(date: string, time: string, party: number) {
  const stools = TABLES.filter((t) => t.zone === "counter");
  const runs: string[][] = [];
  for (let i = 0; i + party <= stools.length; i++) {
    const run = stools.slice(i, i + party);
    if (run.every((s) => !taken(s, date, time))) runs.push(run.map((s) => s.id));
  }
  return runs;
}

/** What a zone can offer this party at this time: bookable "units" (tables or stool runs). */
export function zoneOptions(zone: ZoneId, date: string, time: string, party: number): string[][] {
  if (zone === "counter") {
    // non-overlapping runs, so "3 places free" means three real choices
    const out: string[][] = [];
    const used = new Set<string>();
    for (const r of stoolRuns(date, time, party)) {
      if (r.some((id) => used.has(id))) continue;
      r.forEach((id) => used.add(id));
      out.push(r);
    }
    return party <= 4 ? out : [];
  }
  return TABLES.filter((t) => t.zone === zone && fits(t, party) && !taken(t, date, time)).map((t) => [t.id]);
}

export function slotOpen(date: string, time: string, party: number) {
  return ZONES.some((z) => zoneOptions(z.id, date, time, party).length > 0);
}

export function slotsFor(dow: number) {
  const out: string[] = [];
  if (BOOKING.lunchDays.includes(dow)) out.push(...BOOKING.lunchSlots);
  if (BOOKING.dinnerDays.includes(dow)) out.push(...BOOKING.dinnerSlots);
  return out;
}
