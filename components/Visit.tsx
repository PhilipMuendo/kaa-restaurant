"use client";

import Image from "next/image";
import { WEEK, site } from "@/config/site";
import { hhmm, status, sunset, useNow } from "@/lib/time";
import { floorWords } from "./Hero";
import { Coal } from "./Nav";

/*
 * FIND US. The practical page: where, how to get up there, what to wear, and
 * a line for every day of the week.
 */

export default function Visit() {
  const now = useNow();
  const st = now ? status(now) : null;
  return (
    <section id="visit" data-tone="light" aria-labelledby="visit-title" className="paper relative pb-[14vh] pt-[16vh]">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <h2 id="visit-title" className="d-xl">
            {floorWords} floors up,
            <br />
            <span className="gloss font-[300] tracking-[-0.03em]">in Westlands.</span>
          </h2>
          <address className="mt-10 not-italic">
            <p className="text-[1.25rem] leading-snug">{site.location.address}</p>
            <p className="tick mt-2 text-soot/50">Address is a placeholder</p>
          </address>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.location.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center bg-soot px-6 text-[0.95rem] font-[550] text-ash transition-colors hover:bg-ember hover:text-soot">
              Open in Maps
            </a>
            <a href={site.contact.phoneHref} className="flex h-12 items-center border border-soot/40 px-6 text-[0.95rem] transition-colors hover:border-soot">
              {site.contact.phone}
            </a>
            <a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center border border-soot/40 px-6 text-[0.95rem] transition-colors hover:border-soot">
              WhatsApp
            </a>
          </div>
          <dl className="mt-12 border-t border-soot/15">
            {site.location.gettingHere.map((g) => (
              <div key={g.k} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-soot/10 py-4">
                <dt className="tick pt-1 text-soot/55">{g.k}</dt>
                <dd className="text-[1rem] leading-relaxed">{g.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={site.images.rooftopGlass} alt="A bottle and glass on a rooftop table at dusk, the city fading below" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <div className="mt-8 flex items-center justify-between gap-4 border-b-2 border-soot pb-3">
            <p className="d-md lowercase">opening hours</p>
            <p className="tick flex items-center gap-2 text-soot/70">
              <Coal lit={st ? st.open : null} className="h-2 w-2" />
              {st?.text ?? " "}
            </p>
          </div>
          <ul>
            {WEEK.map((d, i) => {
              const today = now && (now.dow + 6) % 7 === i;
              const bar = d.blocks.find((b) => b.kind === "bar");
              const food = d.blocks.filter((b) => b.kind === "kitchen" || b.kind === "lunch");
              return (
                <li key={d.day} className={`flex items-baseline gap-3 border-b border-soot/10 py-2.5 ${today ? "font-[600]" : ""}`}>
                  <span className="w-24">{d.day}</span>
                  <span className="gloss hidden text-soot/55 sm:inline">{d.title.toLowerCase()}</span>
                  <span className="leader" />
                  <span className="num text-[0.85rem]">{bar ? `${hhmm(bar.from)}–${hhmm(bar.to)}` : "Closed"}</span>
                  <span className="sr-only">{food.length ? `, kitchen ${food.map((f) => `${hhmm(f.from)} to ${hhmm(f.to)}`).join(" and ")}` : ""}</span>
                </li>
              );
            })}
          </ul>
          {now && <p className="tick mt-4 text-soot/50">Sunset in Nairobi today: {hhmm(sunset(now.y, now.m, now.d))}. Hours are placeholders.</p>}
        </div>
      </div>
    </section>
  );
}
