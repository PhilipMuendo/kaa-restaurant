"use client";

import Image from "next/image";
import { motion, useInView, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { STATIONS, formatKES, type Station } from "@/config/site";
import { usePrefersReducedMotion } from "@/lib/useMedia";

/*
 * ONE FIRE, FOUR HEATS. A thermometer runs down the left; as each place on
 * the roof scrolls into view, the mercury climbs or falls to its heat.
 */

const MAX = 650;

function heatColor(temp: number) {
  // the same black-body ramp as the hero's coals
  const t = temp / MAX;
  if (t < 0.25) return "#7A1A08";
  if (t < 0.55) return "#D9461A";
  if (t < 0.8) return "#FF7A2E";
  return "#FFC27A";
}

function Thermometer({ temp, active }: { temp: number; active: number }) {
  const reduce = usePrefersReducedMotion();
  const v = useSpring(temp, { stiffness: 60, damping: 18 });
  useEffect(() => {
    if (reduce) v.jump(temp);
    else v.set(temp);
  }, [temp, v, reduce]);
  const h = useTransform(v, (x) => `${(x / MAX) * 100}%`);
  const label = useTransform(v, (x) => `${Math.round(x)}`);
  return (
    <div className="flex h-full items-stretch gap-6">
      <div className="relative w-3 rounded-full bg-ash/[0.07]">
        <motion.div className="absolute inset-x-0 bottom-0 rounded-full bg-[linear-gradient(to_top,#2a0a04,#7A1A08_20%,#D9461A_50%,#FF7A2E_75%,#FFE2B0)] bg-[length:100%_var(--full)] bg-bottom" style={{ height: h, ["--full" as string]: "62vh" }} />
        <motion.div className="absolute -inset-x-2 bottom-0 blur-md" style={{ height: h, background: `linear-gradient(to top, transparent 60%, ${heatColor(temp)}55)` }} />
      </div>
      <div className="relative w-14">
        {[100, 200, 300, 400, 500, 600].map((d) => (
          <div key={d} className="absolute left-0 flex -translate-y-1/2 items-center gap-2" style={{ bottom: `${(d / MAX) * 100}%` }}>
            <span className="h-px w-3 bg-ash/30" />
            <span className="num text-[0.65rem] text-ash/40">{d}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-between">
        <p className="num text-[clamp(3.6rem,6vw,6rem)] font-[300] leading-none tracking-[-0.04em] text-ash">
          <motion.span>{label}</motion.span>
          <span className="align-top text-[0.4em] text-ember">°C</span>
        </p>
        <ol className="flex flex-col gap-2">
          {STATIONS.map((s, i) => (
            <li key={s.id} className={`flex items-baseline gap-3 transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-35"}`}>
              <span className="num w-10 text-[0.75rem] text-ember">{s.temp}°</span>
              <span className="text-[0.98rem]">{s.name}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Panel({ s, i, onActive }: { s: Station; i: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  useEffect(() => {
    if (inView) onActive(i);
  }, [inView, i, onActive]);
  return (
    <article ref={ref} aria-labelledby={`st-${s.id}`} className="grid grid-cols-1 gap-8 py-[10vh] md:grid-cols-2 md:gap-10 lg:min-h-[92vh] lg:items-center">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width:1024px) 30vw, (min-width:768px) 45vw, 100vw" className="object-cover" placeholder="blur" />
        {/* phones: each place carries its own heat */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-soot/85 to-transparent p-4 lg:hidden">
          <span className="num text-[2.6rem] font-[300] leading-none">
            {s.temp}
            <span className="text-[0.45em] text-ember">°C</span>
          </span>
          <span className="mb-1 h-1.5 w-24 overflow-hidden rounded-full bg-ash/15">
            <span className="block h-full rounded-full" style={{ width: `${(s.temp / MAX) * 100}%`, background: heatColor(s.temp) }} />
          </span>
        </div>
      </div>
      <div>
        <p className="gloss text-[1.15rem] text-ember">{s.line}</p>
        <h3 id={`st-${s.id}`} className="d-lg mt-3 lowercase">
          {s.name}
        </h3>
        <p className="body mt-6 max-w-[36ch] text-ash/75">{s.body}</p>
        <ul className="mt-8 border-t border-ash/15">
          {s.dishes.slice(0, 3).map((d) => (
            <li key={d.name} className="flex items-baseline gap-3 border-b border-ash/10 py-3">
              <span className="text-[1rem]">{d.name}</span>
              <span className="leader" />
              <span className="num text-[0.85rem] text-ash/70">{formatKES(d.price)}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function Fire() {
  const [active, setActive] = useState(0);
  return (
    <section id="fire" data-tone="dark" aria-labelledby="fire-title" className="relative bg-soot pt-[18vh]">
      <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-12">
        <h2 id="fire-title" className="d-xl lg:col-span-8">
          one fire,
          <br />
          <span className="gloss font-[300] tracking-[-0.03em] text-ash/90">four heats.</span>
        </h2>
        <p className="body max-w-[38ch] self-end text-ash/70 lg:col-span-4">
          No gas, no induction. Every plate is cooked over fire: one charcoal supply feeding four places on the roof, each at its own heat.
        </p>
      </div>
      <div className="wrap mt-[6vh] grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
        <div className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-[19vh] h-[62vh]">
            <Thermometer temp={STATIONS[active].temp} active={active} />
          </div>
        </div>
        <div className="lg:col-span-8">
          {STATIONS.map((s, i) => (
            <Panel key={s.id} s={s} i={i} onActive={setActive} />
          ))}
        </div>
      </div>
    </section>
  );
}
