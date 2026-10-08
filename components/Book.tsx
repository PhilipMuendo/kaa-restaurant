"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useState, type FormEvent } from "react";
import { BOOKING, ZONES, site } from "@/config/site";
import { slotOpen, slotsFor, stoolRuns, useBooking, zoneOptions, type Confirmed, type ZoneId } from "@/lib/booking";
import { addDays, hhmm, sunset, toMin, useNow } from "@/lib/time";
import RoofPlan from "./RoofPlan";
import { SunGlyph } from "./Nav";

/*
 * PULL UP A CHAIR. The roof plan and the booking are one tool: choose how
 * many, which day and what time, and the plan shows every free table; pick a
 * zone or point at the exact table. Confirmation prints as a kitchen docket,
 * with a calendar file and WhatsApp.
 */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function dayLabel(key: string) {
  const d = new Date(`${key}T00:00:00Z`);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}
const OCCASIONS = ["No occasion", "Birthday", "Anniversary", "Business", "Celebration", "First visit"];

function icsFor(c: Confirmed) {
  const [y, mo, d] = c.date!.split("-").map(Number);
  const [hh, mm] = c.time!.split(":").map(Number);
  const start = new Date(Date.UTC(y, mo - 1, d, hh - 3, mm));
  const end = new Date(start.getTime() + 2 * 3600e3);
  const f = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kaa//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${c.ref}@kaa`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`,
    `DTEND:${f(end)}`,
    `SUMMARY:${esc(`Kaa: table for ${c.party}`)}`,
    `LOCATION:${esc(site.location.address)}`,
    `DESCRIPTION:${esc(`Booking ${c.ref}. ${ZONES.find((z) => z.id === c.zone)?.name ?? ""}. Call ${site.contact.phone} if plans change.`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function Docket({ c, onAgain }: { c: Confirmed; onAgain: () => void }) {
  const zone = ZONES.find((z) => z.id === c.zone);
  const [y, m, d] = c.date!.split("-").map(Number);
  const set = sunset(y, m - 1, d);
  const download = () => {
    const url = URL.createObjectURL(new Blob([icsFor(c)], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `kaa-${c.ref}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const wa = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(`Hello Kaa, confirming booking ${c.ref}: table for ${c.party}, ${dayLabel(c.date!)} at ${c.time}, ${zone?.name ?? ""}. Name: ${c.name}.`)}`;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center" role="status" aria-live="polite">
      <div className="relative z-10 h-3 w-[22rem] max-w-full rounded-sm bg-soot shadow-[0_6px_14px_rgba(0,0,0,0.35)]" aria-hidden="true" />
      <motion.div
        className="receipt -mt-1.5 w-[20rem] max-w-[92%] px-7 pb-9 pt-8 shadow-[0_24px_40px_-20px_rgba(18,14,12,0.45)]"
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 1.6, ease: [0.45, 0, 0.55, 1] }}
      >
        <div className="num text-center text-[0.72rem] uppercase leading-relaxed tracking-[0.08em]">
          <p className="text-[1.1rem] font-[700] normal-case tracking-[-0.02em] [font-family:var(--font-sans)]">{site.wordmark}.</p>
          <p>Table docket</p>
          <p className="text-[1.3rem] font-[600] tracking-[0.02em]">{c.ref}</p>
        </div>
        <p className="num my-3 overflow-hidden whitespace-nowrap text-[0.7rem] text-[#1b1714]/40" aria-hidden="true">
          ------------------------------------------------------------
        </p>
        <dl className="num text-[0.78rem] uppercase leading-relaxed tracking-[0.04em]">
          {[
            ["Covers", String(c.party)],
            ["Day", dayLabel(c.date!)],
            ["Time", c.time!],
            ["Where", zone?.name ?? "—"],
            ["Table", c.table ? c.table.replace(/,/g, " ") : "Ours to choose"],
            ["Name", c.name],
            ["Sunset", hhmm(set)],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="text-[#1b1714]/55">{k}</dt>
              <span className="leader" />
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="num my-3 overflow-hidden whitespace-nowrap text-[0.7rem] text-[#1b1714]/40" aria-hidden="true">
          ============================================================
        </p>
        <p className="gloss text-center text-[1.05rem]">see you by the fire.</p>
        <p className="num mt-2 text-center text-[0.65rem] uppercase text-[#1b1714]/55">We hold tables for 15 minutes</p>
      </motion.div>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={download} className="h-11 bg-soot px-5 text-[0.92rem] font-[550] text-ash transition-colors hover:bg-ember hover:text-soot">
          Add to calendar
        </button>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center border border-soot px-5 text-[0.92rem] transition-colors hover:bg-soot hover:text-ash">
          Confirm on WhatsApp
        </a>
        <button type="button" onClick={onAgain} className="tick h-11 px-4 underline underline-offset-4">
          Book another
        </button>
      </div>
      <p className="tick mt-4 text-soot/50">Demo booking: no table is actually held.</p>
    </motion.div>
  );
}

export default function Book() {
  const uid = useId();
  const now = useNow();
  const { draft, set, done, setDone } = useBooking();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);

  const days = useMemo(() => (now ? Array.from({ length: BOOKING.daysAhead }, (_, i) => addDays(now, i)) : []), [now]);
  const dateObj = draft.date ? new Date(`${draft.date}T00:00:00Z`) : null;
  const dow = dateObj ? dateObj.getUTCDay() : null;
  const set_ = dateObj ? sunset(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate()) : null;
  const isToday = !!(now && draft.date === now.key);
  const slots = dow === null ? [] : slotsFor(dow);
  const live = !!(draft.date && draft.time);
  const opts = useMemo(
    () => Object.fromEntries(ZONES.map((z) => [z.id, live ? zoneOptions(z.id, draft.date!, draft.time!, draft.party) : []])) as Record<ZoneId, string[][]>,
    [live, draft.date, draft.time, draft.party],
  );
  const picked = draft.table ? draft.table.split(",") : [];
  const ready = live && !!draft.zone && opts[draft.zone].length > 0;
  const zone = ZONES.find((z) => z.id === draft.zone);

  const pickTable = (z: ZoneId, id: string) => {
    if (z === "counter") {
      const run = stoolRuns(draft.date!, draft.time!, draft.party).find((r) => r.includes(id));
      if (run) set({ zone: z, table: run.join(",") });
      return;
    }
    set({ zone: z, table: id });
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      party: draft.party,
      date: draft.date ?? "",
      time: draft.time ?? "",
      zone: draft.zone ?? "",
      table: draft.table ?? "",
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      occasion,
      notes: String(fd.get("notes") ?? ""),
      company: String(fd.get("company") ?? ""),
    };
    const errs: Record<string, string> = {};
    if (!ready) errs.when = "Choose a day, a time and where you'd like to sit.";
    if (body.name.length < 2) errs.name = "Please tell us your name.";
    if (!body.phone && !body.email) errs.phone = "Add a phone number or an email so we can confirm.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`${uid}-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setSending(true);
    setFailed(null);
    try {
      const r = await fetch("/api/book", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = (await r.json()) as { ok: boolean; ref?: string; errors?: Record<string, string>; error?: string };
      if (j.ok && j.ref) {
        setDone({ ...draft, ref: j.ref, name: body.name });
        document.getElementById("book")?.scrollIntoView({ block: "start" });
      } else if (j.errors) setErrors(j.errors);
      else setFailed(j.error ?? "Something went wrong.");
    } catch {
      setFailed("You seem to be offline.");
    } finally {
      setSending(false);
    }
  }

  const chip = (on: boolean, disabled = false) =>
    `relative border transition-colors ${disabled ? "cursor-not-allowed border-soot/10 text-soot/30" : on ? "cursor-pointer border-soot bg-soot text-ash" : "cursor-pointer border-soot/25 hover:border-soot"}`;
  const field = "w-full border-b border-soot/35 bg-transparent py-2.5 text-[1.05rem] outline-none transition-colors placeholder:text-soot/35 focus:border-soot";

  return (
    <section id="book" data-tone="light" aria-labelledby="book-title" className="paper relative scroll-mt-16 pb-[14vh] pt-[16vh]">
      <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-12">
        <h2 id="book-title" className="d-xl lg:col-span-7">
          pull up
          <br />
          <span className="gloss font-[300] tracking-[-0.03em]">a chair.</span>
        </h2>
        <p className="body max-w-[40ch] self-end text-soot/75 lg:col-span-5">
          Choose your night and we&apos;ll show you every free seat on the roof: at the counter facing the fire, on the edge facing the sunset, or round the fire pit.
        </p>
      </div>

      <div className="wrap mt-[7vh] grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">
        {/* the roof */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-20">
            <RoofPlan date={draft.date} time={draft.time} party={draft.party} zone={draft.zone} picked={picked} onPick={pickTable} />
            <div className="tick mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-soot/65" aria-hidden="true">
              <span className="flex items-center gap-2">
                <i className="h-3 w-3 bg-soot" /> Free
              </span>
              <span className="flex items-center gap-2">
                <i className="h-3 w-3 border border-soot/40 bg-[repeating-linear-gradient(45deg,transparent_0_2px,rgba(18,14,12,0.3)_2px_3px)]" /> Taken
              </span>
              <span className="flex items-center gap-2">
                <i className="h-3 w-3 bg-ember" /> Yours
              </span>
              <span className="ml-auto">{live ? "Tap a free table to choose it" : "Choose a day and time to see free tables"}</span>
            </div>
            <AnimatePresence mode="wait">
              {zone && (
                <motion.div key={zone.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 hidden grid-cols-[9rem_1fr] gap-5 lg:grid">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={zone.image.src} alt={zone.image.alt} fill sizes="9rem" className="object-cover" />
                  </div>
                  <div>
                    <p className="d-md lowercase">{zone.name}</p>
                    <p className="gloss mt-1 text-soot/70">{zone.body}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* the booking */}
        <div className="lg:col-span-5">
          {done ? (
            <Docket
              c={done}
              onAgain={() => {
                setDone(null);
                set({ time: null, zone: null, table: null });
              }}
            />
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-9">
              <fieldset>
                <legend className="gloss text-[1.15rem]">How many of you?</legend>
                <div className="mt-3 flex items-center gap-4">
                  <button type="button" aria-label="One fewer" onClick={() => set({ party: Math.max(1, draft.party - 1) })} disabled={draft.party <= 1} className="grid h-11 w-11 place-items-center border border-soot/30 text-[1.3rem] hover:border-soot disabled:opacity-30">
                    −
                  </button>
                  <p className="min-w-[7.5rem] text-center" aria-live="polite">
                    <span className="num text-[2.2rem] leading-none">{draft.party}</span>
                    <span className="ml-2 text-[1rem] text-soot/70">{draft.party === 1 ? "guest" : "guests"}</span>
                  </p>
                  <button type="button" aria-label="One more" onClick={() => set({ party: Math.min(BOOKING.maxParty, draft.party + 1) })} disabled={draft.party >= BOOKING.maxParty} className="grid h-11 w-11 place-items-center border border-soot/30 text-[1.3rem] hover:border-soot disabled:opacity-30">
                    +
                  </button>
                </div>
                {draft.party >= 9 && <p className="gloss mt-2 text-[0.98rem] text-soot/70">Nine or ten of you: that&apos;s the chef&apos;s table.</p>}
                {draft.party >= BOOKING.maxParty && (
                  <p className="tick mt-2 text-soot/60">
                    More than ten?{" "}
                    <a href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent("Hello Kaa, I'd like to book for a large group / the whole roof.")}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      Ask about the whole roof
                    </a>
                  </p>
                )}
              </fieldset>

              <fieldset id={`${uid}-when`} tabIndex={-1} className="min-w-0 outline-none" aria-describedby={errors.when ? `${uid}-when-err` : undefined}>
                <legend className="gloss text-[1.15rem]">Which night?</legend>
                <div className="no-scrollbar -mx-[var(--gutter)] mt-3 flex gap-1.5 overflow-x-auto px-[var(--gutter)] pb-1 lg:mx-0 lg:px-0" data-lenis-prevent>
                  {!now && <p className="tick py-4 text-soot/50">Loading dates…</p>}
                  {days.map((d) => {
                    const closed = BOOKING.closedDays.includes(d.dow);
                    const on = draft.date === d.key;
                    return (
                      <label key={d.key} className={`w-[4.4rem] shrink-0 py-2 text-center ${chip(on, closed)}`} title={closed ? "Closed on Mondays" : undefined}>
                        <input type="radio" name="date" className="sr-only" disabled={closed} checked={on} onChange={() => set({ date: d.key, time: null })} />
                        <span className="tick block">{DAYS[d.dow]}</span>
                        <span className="num block text-[1.45rem] leading-tight">{d.d}</span>
                        <span className="tick block opacity-70">{MONTHS[d.m]}</span>
                      </label>
                    );
                  })}
                </div>
                {draft.date && (
                  <div className="mt-5">
                    <p className="tick flex items-center gap-2 text-soot/65">
                      What time? {set_ !== null && (
                        <span className="flex items-center gap-1.5 text-soot/55">
                          · <SunGlyph /> sunset {hhmm(set_)}
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {slots.map((s) => {
                        const passed = isToday && now ? toMin(s) <= now.min + 30 : false;
                        const open = !passed && slotOpen(draft.date!, s, draft.party);
                        const golden = set_ !== null && toMin(s) >= set_ - 80 && toMin(s) <= set_ - 10;
                        const on = draft.time === s;
                        return (
                          <label key={s} className={`flex items-center gap-1.5 px-3 py-2 ${chip(on, !open)}`}>
                            <input type="radio" name="time" className="sr-only" disabled={!open} checked={on} onChange={() => set({ time: s })} />
                            <span className="num text-[0.9rem]">{s}</span>
                            {golden && open && <SunGlyph className={`h-3 w-3 ${on ? "text-ember" : "text-ember/80"}`} />}
                            <span className="sr-only">{!open ? (passed ? " (passed)" : " (full)") : golden ? " (golden hour)" : ""}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="tick mt-2 text-soot/45">
                      <SunGlyph className="mr-1 inline h-3 w-3 text-ember" /> golden hour on the edge
                    </p>
                  </div>
                )}
                {errors.when && (
                  <p id={`${uid}-when-err`} className="tick mt-3 text-[#B3261E]">
                    ↳ {errors.when}
                  </p>
                )}
              </fieldset>

              <fieldset className={live ? "" : "pointer-events-none opacity-40"} disabled={!live}>
                <legend className="gloss text-[1.15rem]">Where would you like to sit?</legend>
                <div className="mt-3 flex flex-col">
                  {ZONES.map((z) => {
                    const n = opts[z.id].length;
                    const tooSmall = z.min && draft.party < z.min;
                    const tooBig = draft.party > z.max;
                    const on = draft.zone === z.id;
                    const label = !live ? z.seats : tooSmall ? `For ${z.min} or more` : tooBig ? `Up to ${z.max}` : n === 0 ? "Full at this time" : z.id === "counter" ? `${n} ${n === 1 ? "place" : "places"} for ${draft.party}` : `${n} ${n === 1 ? "table" : "tables"} free`;
                    const disabled = live && n === 0;
                    return (
                      <label key={z.id} className={`flex items-baseline gap-3 border-b border-soot/12 py-3.5 ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
                        <input type="radio" name="zone" className="peer sr-only" disabled={disabled} checked={on} onChange={() => set({ zone: z.id, table: null })} />
                        <span aria-hidden="true" className={`h-3 w-3 shrink-0 translate-y-[1px] rounded-full border ${on ? "border-ember bg-ember shadow-[0_0_8px_rgba(255,107,44,0.7)]" : "border-soot/40"}`} />
                        <span className="text-[1.08rem] font-[500]">{z.name}</span>
                        <span className="leader" />
                        <span className="tick text-soot/60">{label}</span>
                      </label>
                    );
                  })}
                </div>
                {draft.zone && !draft.table && live && opts[draft.zone].length > 0 && <p className="gloss mt-2 text-[0.98rem] text-soot/60">We&apos;ll choose the best free table, or point at one on the plan.</p>}
              </fieldset>

              <fieldset className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <legend className="gloss mb-1 text-[1.15rem]">Who&apos;s coming?</legend>
                <div className="sm:col-span-2">
                  <label htmlFor={`${uid}-name`} className="tick text-soot/60">
                    Name for the booking
                  </label>
                  <input id={`${uid}-name`} name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-err` : undefined} />
                  {errors.name && (
                    <p id={`${uid}-name-err`} className="tick mt-2 text-[#B3261E]">
                      ↳ {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor={`${uid}-phone`} className="tick text-soot/60">
                    Phone / WhatsApp
                  </label>
                  <input id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="+254" className={field} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${uid}-phone-err` : undefined} />
                  {errors.phone && (
                    <p id={`${uid}-phone-err`} className="tick mt-2 text-[#B3261E]">
                      ↳ {errors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor={`${uid}-email`} className="tick text-soot/60">
                    Email
                  </label>
                  <input id={`${uid}-email`} name="email" type="email" autoComplete="email" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-err` : undefined} />
                  {errors.email && (
                    <p id={`${uid}-email-err`} className="tick mt-2 text-[#B3261E]">
                      ↳ {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor={`${uid}-occasion`} className="tick text-soot/60">
                    Occasion
                  </label>
                  <select id={`${uid}-occasion`} value={occasion} onChange={(e) => setOccasion(e.target.value)} className={`${field} appearance-none`}>
                    {OCCASIONS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`${uid}-notes`} className="tick text-soot/60">
                    Allergies or requests
                  </label>
                  <input id={`${uid}-notes`} name="notes" className={field} placeholder="Optional" />
                </div>
                <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
                  <label>
                    Company <input name="company" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
              </fieldset>

              <div className="border-t-2 border-soot pt-5">
                <p className="text-[1.05rem]" aria-live="polite">
                  {draft.date && draft.time ? (
                    <>
                      Table for <strong className="font-[600]">{draft.party}</strong> · {dayLabel(draft.date)} at {draft.time}
                      {zone ? ` · ${zone.name}` : ""}
                      {draft.table ? ` (${draft.table.replace(/,/g, " ")})` : ""}
                    </>
                  ) : (
                    <span className="text-soot/55">Table for {draft.party}: choose a night and a time</span>
                  )}
                </p>
                <button type="submit" disabled={sending} className="group mt-5 flex h-14 w-full items-center justify-between bg-soot px-6 text-[1.02rem] font-[550] text-ash transition-colors hover:bg-ember hover:text-soot disabled:opacity-60">
                  {sending ? "Sending…" : "Request this table"}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
                {failed && (
                  <p role="alert" className="tick mt-3 text-[#B3261E]">
                    ↳ {failed} You can also book on{" "}
                    <a href={`https://wa.me/${site.contact.whatsapp}`} className="underline" target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                    .
                  </p>
                )}
                <p className="tick mt-3 text-soot/50">Availability shown is a demo. We confirm every booking by text.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
