"use client";

import { WEEK } from "@/config/site";
import { useBooking } from "@/lib/booking";
import { addDays, hhmm, useNow, weekDay } from "@/lib/time";
import { useScrollTo } from "@/lib/smooth-scroll";

/*
 * THE WEEK as a timetable you can read at a glance: when the kitchen is
 * cooking, when the bar's pouring, when the records go on. Today is marked,
 * with a line at the current time in Nairobi.
 */

const START = 12 * 60;
const END = 25.5 * 60;
const pct = (m: number) => `${((Math.min(Math.max(m, START), END) - START) / (END - START)) * 100}%`;
const HOURS = [12, 14, 16, 18, 20, 22, 24];

export default function Week() {
  const now = useNow();
  const { set } = useBooking();
  const scrollTo = useScrollTo();
  const todayIdx = now ? (now.dow + 6) % 7 : -1;

  const bookDay = (i: number) => {
    if (!now) return;
    const dow = (i + 1) % 7; // WEEK index → JS day
    let ahead = (dow - now.dow + 7) % 7;
    const day = weekDay(dow);
    const lastStart = Math.max(...day.blocks.filter((b) => b.kind === "kitchen" || b.kind === "lunch").map((b) => b.to));
    if (ahead === 0 && now.min > lastStart - 60) ahead = 7;
    set({ date: addDays(now, ahead).key, time: null });
    scrollTo("#book");
  };

  return (
    <section id="week" data-tone="dark" aria-labelledby="week-title" className="relative bg-soot pb-[14vh] pt-[16vh]">
      <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-12">
        <h2 id="week-title" className="d-xl lg:col-span-7">
          the week
          <br />
          <span className="gloss font-[300] tracking-[-0.03em]">at kaa.</span>
        </h2>
        <dl className="tick flex flex-wrap items-center gap-x-6 gap-y-2 self-end text-ash/70 lg:col-span-5 lg:justify-end">
          <div className="flex items-center gap-2">
            <dt className="h-2.5 w-6 bg-ash" />
            <dd>Kitchen</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="h-2.5 w-6 border border-ash/50" />
            <dd>Bar</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="h-2.5 w-6 bg-ember" />
            <dd>Records</dd>
          </div>
        </dl>
      </div>

      <div className="wrap mt-[7vh]">
        {/* hour scale */}
        <div className="grid grid-cols-[6.5rem_1fr] gap-4 md:grid-cols-[10rem_1fr_9rem]" aria-hidden="true">
          <span />
          <div className="relative h-5">
            {HOURS.map((h) => (
              <span key={h} className="num absolute -translate-x-1/2 text-[0.65rem] text-ash/40" style={{ left: pct(h * 60) }}>
                {String(h % 24).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
        <ol>
          {WEEK.map((d, i) => {
            const today = i === todayIdx;
            const bookable = d.blocks.some((b) => b.kind === "kitchen" || b.kind === "lunch");
            return (
              <li key={d.day} className={`grid grid-cols-[6.5rem_1fr] items-center gap-4 border-t py-5 md:grid-cols-[10rem_1fr_9rem] ${today ? "border-ember/60" : "border-ash/10"}`}>
                <div>
                  <p className={`d-md lowercase ${today ? "text-ember" : ""}`}>
                    <span className="md:hidden">{d.short}</span>
                    <span className="hidden md:inline">{d.day}</span>
                  </p>
                  {today && <p className="tick text-ember">Today</p>}
                </div>
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-3 text-[1rem]">
                    <span className="font-[550]">{d.title}</span>
                    <span className="gloss text-ash/60">{d.note}</span>
                  </p>
                  <div className="relative mt-3 h-6" role="img" aria-label={d.blocks.length ? d.blocks.map((b) => `${b.label} ${hhmm(b.from)} to ${hhmm(b.to)}`).join("; ") : "Closed"}>
                    {HOURS.map((h) => (
                      <span key={h} className="absolute inset-y-0 w-px bg-ash/[0.07]" style={{ left: pct(h * 60) }} />
                    ))}
                    {d.blocks
                      .filter((b) => b.kind === "bar")
                      .map((b) => (
                        <span key={b.label} className="absolute inset-y-0 border border-ash/45" style={{ left: pct(b.from), right: `calc(100% - ${pct(b.to)})` }} />
                      ))}
                    {d.blocks
                      .filter((b) => b.kind !== "bar")
                      .map((b) => (
                        <span
                          key={b.label}
                          className={`absolute ${b.kind === "music" ? "inset-y-[9px] bg-ember" : "inset-y-[5px] bg-ash"}`}
                          style={{ left: pct(b.from), right: `calc(100% - ${pct(b.to)})` }}
                        />
                      ))}
                    {today && now && now.min >= START && (
                      <span className="absolute -inset-y-2 w-0.5 bg-ember shadow-[0_0_10px_rgba(255,107,44,0.9)]" style={{ left: pct(now.min) }}>
                        <span className="num absolute -top-4 left-1 whitespace-nowrap text-[0.6rem] text-ember">{hhmm(now.min)}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1 md:text-right">
                  {bookable ? (
                    <button type="button" onClick={() => bookDay(i)} className="tick text-ash/80 underline decoration-ash/30 underline-offset-4 transition-colors hover:text-ember">
                      Book {d.short} →
                    </button>
                  ) : (
                    <span className="tick text-ash/30">Closed</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="tick mt-6 text-ash/45">Times in Nairobi (EAT). Hours are placeholders. Walk-ins welcome at the bar.</p>
      </div>
    </section>
  );
}
