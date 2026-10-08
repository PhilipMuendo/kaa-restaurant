"use client";

import { useSyncExternalStore } from "react";
import { WEEK, site } from "@/config/site";

/*
 * Nairobi time, the sun and the fire. Nairobi is UTC+3 all year (no DST), so
 * "local" here is simply UTC shifted by three hours, whatever the visitor's
 * own time zone is.
 */

const EAT = 3 * 60 * 60 * 1000;

export type Local = { y: number; m: number; d: number; dow: number; min: number; key: string };

export function nairobi(ms: number): Local {
  const t = new Date(ms + EAT);
  const y = t.getUTCFullYear(), m = t.getUTCMonth(), d = t.getUTCDate();
  return { y, m, d, dow: t.getUTCDay(), min: t.getUTCHours() * 60 + t.getUTCMinutes(), key: isoDate(y, m, d) };
}

export const isoDate = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Add days to a Nairobi calendar date (no time-zone drift: done in UTC). */
export function addDays(l: Pick<Local, "y" | "m" | "d">, n: number) {
  const t = new Date(Date.UTC(l.y, l.m, l.d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate(), dow: t.getUTCDay(), key: isoDate(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()) };
}

export const hhmm = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));

/** Sunset in Nairobi minutes for a calendar date (NOAA approximation, ±1 min). */
export function sunset(y: number, m: number, d: number, lat = site.location.lat, lon = site.location.lon) {
  const rad = Math.PI / 180;
  const start = Date.UTC(y, 0, 1);
  const doy = Math.round((Date.UTC(y, m, d) - start) / 864e5) + 1;
  const g = ((2 * Math.PI) / 365) * (doy - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(decl)) - Math.tan(lat * rad) * Math.tan(decl)) / rad;
  const utc = 720 - 4 * (lon - ha) - eq;
  return Math.round(utc + 180);
}

/** WEEK runs Monday→Sunday; JS getDay() runs Sunday→Saturday. */
export const weekDay = (dow: number) => WEEK[(dow + 6) % 7];

/** What's happening right now, from the week in config. */
export function status(now: Local) {
  const today = weekDay(now.dow);
  const yesterday = weekDay((now.dow + 6) % 7);
  const live = [
    ...today.blocks.filter((b) => now.min >= b.from && now.min < b.to),
    ...yesterday.blocks.filter((b) => b.to > 1440 && now.min < b.to - 1440),
  ];
  const kitchen = live.find((b) => b.kind === "kitchen" || b.kind === "lunch");
  const bar = live.find((b) => b.kind === "bar");
  if (kitchen) return { open: true, text: `Fire lit · kitchen until ${hhmm(kitchen.to)}` };
  if (bar) return { open: true, text: `Bar open until ${hhmm(bar.to)}` };
  // next opening
  for (let i = 0; i < 8; i++) {
    const day = weekDay((now.dow + i) % 7);
    const first = [...day.blocks].sort((a, b) => a.from - b.from)[0];
    if (!first) continue;
    if (i === 0 && first.from <= now.min) continue;
    const when = i === 0 ? "today" : i === 1 ? "tomorrow" : day.day;
    return { open: false, text: `Fire lit ${when} at ${hhmm(first.from)}` };
  }
  return { open: false, text: "Closed" };
}

// minute-resolution clock; null on the server and during hydration
const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 20_000);
  return () => window.clearInterval(id);
};
export function useNow(): Local | null {
  const minute = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60_000),
    () => -1,
  );
  return minute < 0 ? null : nairobi(minute * 60_000);
}
