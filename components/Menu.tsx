"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { STATIONS, SWEET, TASTING, formatKES, site, type Diet, type Dish } from "@/config/site";
import { useBooking } from "@/lib/booking";
import { useScrollTo } from "@/lib/smooth-scroll";

/*
 * THE MENU, set like the printed card on the table: grouped by fire, priced in
 * shillings, marked for diets. Filter it to what you eat; the rest steps back.
 */

const FILTERS: { id: "all" | Diet | "nn"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "v", label: "Vegetarian" },
  { id: "vg", label: "Vegan" },
  { id: "gf", label: "No gluten" },
  { id: "nn", label: "No nuts" },
];

const BLOCKS = [
  ...STATIONS.map((s) => ({ id: s.id, name: s.name, temp: `${s.temp}°`, dishes: s.dishes })),
  { id: "sweet", name: "Something sweet", temp: "", dishes: SWEET },
];

const PLATES: Record<string, { src: typeof site.images.embers; alt: string }> = {
  embers: { src: site.images.vegBowl, alt: "Roasted vegetables in a black bowl" },
  grill: { src: site.images.fishLeaf, alt: "A whole grilled fish on a banana leaf" },
  oven: { src: site.images.ovenBread, alt: "Bread baking at the mouth of a wood-fired oven" },
  pit: { src: site.images.ribs, alt: "Beef ribs, charred and glistening, on the grill" },
  sweet: { src: site.images.dessert, alt: "A dark dessert plate with a slice of cake and cream" },
};

const matches = (d: Dish, f: (typeof FILTERS)[number]["id"]) => {
  if (f === "all") return true;
  if (f === "nn") return !d.diet.includes("n");
  if (f === "v") return d.diet.includes("v") || d.diet.includes("vg");
  return d.diet.includes(f);
};

export default function Menu() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [plate, setPlate] = useState("grill");
  const { set } = useBooking();
  const scrollTo = useScrollTo();
  const count = BLOCKS.flatMap((b) => b.dishes).filter((d) => matches(d, filter)).length;

  return (
    <section id="menu" data-tone="light" aria-labelledby="menu-title" className="paper relative pb-[14vh] pt-[16vh]">
      <div className="wrap grid grid-cols-1 gap-8 lg:grid-cols-12">
        <h2 id="menu-title" className="d-xl lg:col-span-7">
          tonight,
          <br />
          <span className="gloss font-[300] tracking-[-0.03em]">from the fire.</span>
        </h2>
        <div className="flex flex-col justify-end gap-5 lg:col-span-5">
          <p className="body max-w-[40ch] text-soot/75">The menu follows the market and the fire. Everything is made to share; order a few things from each heat.</p>
          <div role="radiogroup" aria-label="Show dishes that are" className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`tick border px-3 py-2 transition-colors ${filter === f.id ? "border-soot bg-soot text-ash" : "border-soot/25 hover:border-soot/60"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="tick text-soot/55" aria-live="polite">
            {count} dishes · sample menu, placeholder prices in KES
          </p>
        </div>
      </div>

      <div className="wrap mt-[8vh] grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2 lg:col-span-8">
          {BLOCKS.map((b) => (
            <div key={b.id} onPointerEnter={() => setPlate(b.id)} onFocus={() => setPlate(b.id)}>
              <h3 className="flex items-baseline justify-between border-b-2 border-soot pb-2">
                <span className="d-md lowercase">{b.name}</span>
                <span className="num text-[0.8rem] text-soot/60">{b.temp}</span>
              </h3>
              <ul>
                {b.dishes.map((d) => {
                  const on = matches(d, filter);
                  return (
                    <li key={d.name} className={`border-b border-soot/10 py-3.5 transition-opacity duration-300 ${on ? "opacity-100" : "opacity-25"}`}>
                      <p className="flex items-baseline gap-3">
                        <span className="text-[1.05rem] font-[500] leading-snug">{d.name}</span>
                        {d.diet.length > 0 && (
                          <span className="num text-[0.65rem] text-soot/55" aria-label={d.diet.map((x) => ({ v: "vegetarian", vg: "vegan", gf: "no gluten", n: "contains nuts" })[x]).join(", ")}>
                            {d.diet.join(" ")}
                          </span>
                        )}
                        <span className="leader" />
                        <span className="num text-[0.9rem]">{formatKES(d.price)}</span>
                      </p>
                      <p className="gloss mt-0.5 text-[1rem] text-soot/65">{d.note}</p>
                      {!on && <span className="sr-only">(doesn&apos;t match your filter)</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="flex flex-col justify-between gap-6 bg-soot p-7 text-ash md:col-span-2 md:flex-row md:items-end">
            <div>
              <p className="gloss text-[1.1rem] text-ember">The tasting menu</p>
              <p className="d-lg mt-2 lowercase">{TASTING.name}</p>
              <p className="mt-3 max-w-[40ch] text-ash/75">{TASTING.body}</p>
            </div>
            <div className="flex flex-col items-start gap-4 md:items-end">
              <p className="num text-[0.95rem] text-ash/85">
                {formatKES(TASTING.price)} · pairing +{formatKES(TASTING.pairing)}
              </p>
              <button
                type="button"
                onClick={() => {
                  set({ zone: "counter" });
                  scrollTo("#book");
                }}
                className="h-11 bg-ash px-5 text-[0.92rem] font-[550] text-soot transition-colors hover:bg-ember"
              >
                Book the counter
              </button>
            </div>
          </div>
          <p className="tick text-soot/55 md:col-span-2">v vegetarian · vg vegan · gf no gluten · n contains nuts. Tell us about allergies when you book; the kitchen will cook around them.</p>
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24">
            <div className="relative aspect-[4/5] overflow-hidden bg-soot">
              <AnimatePresence initial={false}>
                <motion.div key={plate} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                  <Image src={PLATES[plate].src} alt={PLATES[plate].alt} fill sizes="30vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="gloss mt-3 text-[1rem] text-soot/60">{BLOCKS.find((b) => b.id === plate)?.name.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
