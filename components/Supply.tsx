"use client";

import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { SUPPLY, site } from "@/config/site";
import { useNow } from "@/lib/time";
import { usePrefersReducedMotion } from "@/lib/useMedia";

/*
 * WHERE IT COMES FROM, as the supply ticket the kitchen actually keeps:
 * every supplier, every town, how far it travelled. It prints as you arrive.
 */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export default function Supply() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = usePrefersReducedMotion();
  const on = inView || reduce;
  const now = useNow();
  const avg = Math.round(SUPPLY.reduce((a, s) => a + s.km, 0) / SUPPLY.length);
  const date = now ? `${String(now.d).padStart(2, "0")} ${MONTHS[now.m]} ${now.y}` : "— — ——";

  return (
    <section id="supply" data-tone="light" aria-labelledby="supply-title" className="paper relative overflow-hidden pb-[14vh] pt-[16vh]">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <h2 id="supply-title" className="d-xl">
            we know
            <br />
            every name
            <br />
            <span className="gloss font-[300] tracking-[-0.03em]">on this receipt.</span>
          </h2>
          <p className="body mt-8 max-w-[38ch] text-soot/75">
            Fish from the beach at Dunga, beef from Laikipia, honey from Baringo, charcoal pressed from macadamia shells in Murang&apos;a. Nothing travels further than it has to.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={site.images.vegGrill} alt="Vegetables charring on a grill" fill sizes="(min-width:1024px) 15vw, 45vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] translate-y-8 overflow-hidden">
              <Image src={site.images.platingHands} alt="A cook's tattooed hands plating greens" fill sizes="(min-width:1024px) 15vw, 45vw" className="object-cover" />
            </div>
          </div>
        </div>

        <div ref={ref} className="flex justify-center lg:col-span-6 lg:col-start-7">
          <div className="w-full max-w-[26rem]">
            {/* the printer's slot */}
            <div className="relative z-10 mx-auto h-3 w-[108%] -translate-x-[3.7%] rounded-sm bg-soot shadow-[0_6px_14px_rgba(0,0,0,0.35)]" aria-hidden="true" />
            <motion.div
              className="receipt -mt-1.5 origin-top rotate-[0.6deg] px-7 pb-10 pt-9 shadow-[0_24px_40px_-20px_rgba(18,14,12,0.45)]"
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={on ? { clipPath: "inset(0 0 0% 0)" } : undefined}
              transition={{ duration: reduce ? 0 : 2.4, ease: [0.45, 0, 0.55, 1] }}
            >
              <div className="num text-center text-[0.72rem] uppercase leading-relaxed tracking-[0.08em]">
                <p className="text-[1.1rem] font-[700] normal-case tracking-[-0.02em] [font-family:var(--font-sans)]">{site.wordmark}.</p>
                <p>Supply ticket · No. 0427</p>
                <p className="text-[#1b1714]/60">{date} · Westlands</p>
              </div>
              <p className="num my-4 overflow-hidden whitespace-nowrap text-[0.7rem] text-[#1b1714]/40" aria-hidden="true">
                ------------------------------------------------------------
              </p>
              <ul className="num text-[0.74rem] uppercase leading-snug tracking-[0.04em]">
                <li className="flex justify-between pb-2 text-[#1b1714]/55" aria-hidden="true">
                  <span>Item / from</span>
                  <span>Km</span>
                </li>
                {SUPPLY.map((s, i) => (
                  <motion.li key={s.item} className="flex items-baseline gap-2 py-1.5" initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : undefined} transition={{ delay: reduce ? 0 : 0.25 + i * 0.18 }}>
                    <span>
                      {s.item}
                      <span className="block text-[#1b1714]/55">{s.from}</span>
                    </span>
                    <span className="leader" />
                    <span>{s.km}</span>
                  </motion.li>
                ))}
              </ul>
              <p className="num my-4 overflow-hidden whitespace-nowrap text-[0.7rem] text-[#1b1714]/40" aria-hidden="true">
                ============================================================
              </p>
              <div className="num flex justify-between text-[0.8rem] uppercase tracking-[0.04em]">
                <span>{SUPPLY.length} suppliers</span>
                <span>avg {avg} km</span>
              </div>
              <p className="num mt-6 text-center text-[0.72rem] uppercase tracking-[0.08em]">Asante sana, wakulima</p>
              <p className="gloss text-center text-[0.95rem] text-[#1b1714]/60">thank you, farmers</p>
              <div className="mx-auto mt-5 flex h-9 w-44 items-stretch gap-[2px]" aria-hidden="true">
                {Array.from({ length: 38 }).map((_, i) => (
                  <span key={i} className="bg-[#1b1714]" style={{ width: [1, 2, 1, 3, 1, 2][(i * 7) % 6] }} />
                ))}
              </div>
            </motion.div>
            <p className="tick mt-6 text-center text-soot/50">Suppliers and distances are placeholders.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
