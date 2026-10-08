"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useId, useState } from "react";
import { DRINKS, formatKES, site, type Drink, type Glass } from "@/config/site";

/*
 * THE BAR. Choose a drink and it's poured: the glass fills layer by layer in
 * the true proportions of what goes in it, every layer labelled in ml.
 */

type Shape = { outline: string; inner: string; top: number; bottom: number; cap: number; ice?: boolean };
const GLASSES: Record<Glass, Shape> = {
  rocks: {
    outline: "M46 118 L52 268 Q53 280 66 280 L154 280 Q167 280 168 268 L174 118",
    inner: "M50 118 L56 266 Q57 275 67 275 L153 275 Q163 275 164 266 L170 118 Z",
    top: 118,
    bottom: 275,
    cap: 150,
    ice: true,
  },
  coupe: {
    outline: "M24 104 Q34 176 110 180 Q186 176 196 104 M110 180 L110 268 M74 280 Q110 266 146 280",
    inner: "M28 104 Q38 172 110 176 Q182 172 192 104 Z",
    top: 104,
    bottom: 176,
    cap: 130,
  },
  martini: {
    outline: "M20 92 L110 178 L200 92 M110 178 L110 268 M74 280 Q110 266 146 280",
    inner: "M26 92 L110 172 L194 92 Z",
    top: 92,
    bottom: 172,
    cap: 120,
  },
  highball: {
    outline: "M62 52 L66 270 Q67 280 78 280 L142 280 Q153 280 154 270 L158 52",
    inner: "M66 52 L70 268 Q71 275 79 275 L141 275 Q149 275 150 268 L154 52 Z",
    top: 52,
    bottom: 275,
    cap: 260,
    ice: true,
  },
};

function Pour({ d }: { d: Drink }) {
  const uid = useId().replace(/:/g, "");
  const g = GLASSES[d.glass];
  const total = d.layers.reduce((a, l) => a + l.ml, 0);
  const fill = Math.min(0.9, total / g.cap) * (g.bottom - g.top);
  let acc = 0;
  const layers = d.layers.map((l) => {
    const h = (l.ml / total) * fill;
    const y = g.bottom - acc - h;
    acc += h;
    return { ...l, y, h };
  });
  return (
    <svg viewBox="0 40 450 250" className="h-auto w-full max-w-[38rem]" role="img" aria-label={`${d.name}: ${d.layers.map((l) => `${l.ml} ml ${l.label}`).join(", ")}`}>
      <defs>
        <clipPath id={`in-${uid}`}>
          <path d={g.inner} />
        </clipPath>
        <linearGradient id={`sheen-${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#in-${uid})`}>
        {layers.map((l, i) => (
          <motion.rect
            key={`${d.name}-${l.label}`}
            x="0"
            width="220"
            fill={l.color}
            initial={{ y: g.bottom, height: 0 }}
            animate={{ y: l.y, height: l.h + 0.6 }}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.45, ease: [0.33, 1, 0.68, 1] }}
          />
        ))}
        {g.ice && (
          <motion.g initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <rect x="80" y={g.bottom - fill * 0.72} width="56" height="50" rx="6" fill="#fff" fillOpacity="0.13" stroke="#fff" strokeOpacity="0.35" transform={`rotate(-8 108 ${g.bottom - fill * 0.5})`} />
          </motion.g>
        )}
        <rect x="0" y="0" width="220" height="300" fill={`url(#sheen-${uid})`} />
      </g>
      <path d={g.outline} fill="none" stroke="#ECE4D8" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" />
      {/* the recipe, aligned to each layer */}
      {layers.map((l, i) => (
        <motion.g key={`lb-${d.name}-${l.label}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.45 }}>
          <line x1="212" x2="226" y1={l.y + l.h / 2} y2={l.y + l.h / 2} stroke="#ECE4D8" strokeOpacity="0.4" />
          <text x="232" y={l.y + l.h / 2 + 4} fontSize="11" fill="#ECE4D8" className="font-mono max-sm:text-[15px]">
            <tspan fillOpacity="0.55">{l.ml} ML </tspan>
            {l.label.toUpperCase()}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

export default function Bar() {
  const [zero, setZero] = useState(false);
  const list = DRINKS.filter((d) => !!d.zero === zero);
  const [pick, setPick] = useState(DRINKS[0].name);
  const drink = list.find((d) => d.name === pick) ?? list[0];

  return (
    <section id="bar" data-tone="dark" aria-labelledby="bar-title" className="relative bg-char pb-[14vh] pt-[16vh]">
      <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-12">
        <h2 id="bar-title" className="d-xl lg:col-span-8">
          drinks with
          <br />
          <span className="gloss font-[300] tracking-[-0.03em]">smoke in them.</span>
        </h2>
        <p className="body max-w-[38ch] self-end text-ash/70 lg:col-span-4">
          Hibiscus, tamarind, baobab, Baringo honey and Nyeri coffee, worked into the classics. Choose one and watch it poured.
        </p>
      </div>

      <div className="wrap mt-[8vh] grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="flex justify-center lg:col-span-6">
          <Pour key={drink.name} d={drink} />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <div role="radiogroup" aria-label="Drinks" className="flex border border-ash/20">
            {[false, true].map((z) => (
              <button
                key={String(z)}
                type="button"
                role="radio"
                aria-checked={zero === z}
                onClick={() => {
                  setZero(z);
                  setPick(DRINKS.find((d) => !!d.zero === z)!.name);
                }}
                className={`tick flex-1 py-3 transition-colors ${zero === z ? "bg-ash text-soot" : "text-ash/70 hover:text-ash"}`}
              >
                {z ? "Zero proof" : "Cocktails"}
              </button>
            ))}
          </div>
          <ul role="radiogroup" aria-label={zero ? "Zero-proof drinks" : "Cocktails"} className="mt-4">
            {list.map((d) => {
              const on = d.name === drink.name;
              return (
                <li key={d.name}>
                  <button type="button" role="radio" aria-checked={on} onClick={() => setPick(d.name)} className="group w-full border-b border-ash/10 py-4 text-left">
                    <span className="flex items-baseline gap-3">
                      <span className={`d-md lowercase transition-colors ${on ? "text-ember" : "text-ash group-hover:text-ash"}`}>{d.name}</span>
                      <span className="leader" />
                      <span className="num text-[0.85rem] text-ash/75">{formatKES(d.price)}</span>
                    </span>
                    <motion.span initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }} className="block overflow-hidden">
                      <span className="gloss block pt-2 text-[1.02rem] text-ash/70">{d.note}</span>
                    </motion.span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="tick mt-5 text-ash/45">Placeholder prices in KES. Over-18s only; please drink responsibly.</p>
        </div>
      </div>

      <div className="wrap mt-[10vh] grid grid-cols-2 gap-3 md:grid-cols-12">
        <div className="relative aspect-[4/3] overflow-hidden md:col-span-7">
          <Image src={site.images.barNight} alt="A dim, busy bar counter at night with people talking over drinks" fill sizes="(min-width:768px) 58vw, 50vw" className="object-cover" placeholder="blur" />
        </div>
        <div className="relative aspect-[3/4] overflow-hidden md:col-span-5 md:aspect-auto">
          <Image src={site.images.bartender} alt="A bartender shaking a cocktail in front of a lit back bar" fill sizes="(min-width:768px) 40vw, 50vw" className="object-cover" placeholder="blur" />
        </div>
      </div>
    </section>
  );
}
