import { NextResponse } from "next/server";
import { BOOKING, TABLES, ZONES } from "@/config/site";

/**
 * Table requests. Validates against the same rules the page uses (open days,
 * slots, party sizes, zones), drops honeypot submissions, and forwards to
 * BOOKING_WEBHOOK_URL (the reservation system, a CRM, Zapier/Make, Slack…)
 * when set. Without a webhook it logs non-personal fields only.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{7,20}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.company === "string" && body.company.trim()) return NextResponse.json({ ok: true, ref: "KAA-000000" });

  const str = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const party = typeof body.party === "number" ? Math.round(body.party) : NaN;
  const data = {
    party,
    date: str("date", 10),
    time: str("time", 5),
    zone: str("zone", 12),
    table: str("table", 40),
    name: str("name", 120),
    phone: str("phone", 30),
    email: str("email", 160),
    occasion: str("occasion", 40),
    notes: str("notes", 600),
  };

  const errors: Record<string, string> = {};
  const zone = ZONES.find((z) => z.id === data.zone);
  if (!(party >= 1 && party <= BOOKING.maxParty)) errors.when = "Party size must be 1 to 10.";
  if (!DATE.test(data.date)) errors.when = "Choose a day.";
  else {
    const d = new Date(`${data.date}T00:00:00Z`);
    const nowEAT = Date.now() + 3 * 3600e3;
    const today = Date.UTC(new Date(nowEAT).getUTCFullYear(), new Date(nowEAT).getUTCMonth(), new Date(nowEAT).getUTCDate());
    const diff = Math.round((d.getTime() - today) / 864e5);
    const dow = d.getUTCDay();
    const slots = [...(BOOKING.lunchDays.includes(dow) ? BOOKING.lunchSlots : []), ...(BOOKING.dinnerDays.includes(dow) ? BOOKING.dinnerSlots : [])];
    if (diff < 0 || diff >= BOOKING.daysAhead + 1) errors.when = "That day isn't open for booking yet.";
    else if (!slots.includes(data.time)) errors.when = "Choose one of the times shown.";
  }
  if (!zone) errors.when = errors.when ?? "Choose where you'd like to sit.";
  else if (party > zone.max || (zone.min && party < zone.min)) errors.when = `${zone.name} seats ${zone.min ? `${zone.min}–` : "up to "}${zone.max}.`;
  if (data.table && !data.table.split(",").every((id) => TABLES.some((t) => t.id === id && t.zone === data.zone))) errors.when = "That table isn't in the chosen area.";
  if (data.name.length < 2) errors.name = "Please tell us your name.";
  if (!data.phone && !data.email) errors.phone = "Add a phone number or an email so we can confirm.";
  if (data.phone && !PHONE.test(data.phone)) errors.phone = "That number doesn't look right.";
  if (data.email && !EMAIL.test(data.email)) errors.email = "That email doesn't look right.";
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const ref = `KAA-${Date.now().toString(36).slice(-5).toUpperCase()}`;
  const hook = process.env.BOOKING_WEBHOOK_URL;
  if (hook) {
    try {
      const r = await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, ref, source: "kaa-website", receivedAt: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error(String(r.status));
    } catch {
      return NextResponse.json({ ok: false, error: "We couldn't send that just now." }, { status: 502 });
    }
  } else {
    console.info("[book]", ref, data.date, data.time, `x${data.party}`, data.zone, data.table || "-");
  }
  return NextResponse.json({ ok: true, ref });
}
