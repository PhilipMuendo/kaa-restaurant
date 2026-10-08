"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { useScrollTo } from "@/lib/smooth-scroll";
import { usePrefersReducedMotion, useFinePointer } from "@/lib/useMedia";

const EmberField = dynamic(() => import("./EmberField"), { ssr: false });

const WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
export const floorWords = WORDS[site.location.floor] ?? String(site.location.floor);

/*
 * A bed of live coals fills the screen. Move over it and it flares. Scroll and
 * the camera lifts with the sparks until the coals are gone and the city is
 * below: you're on the roof.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();
  const reduce = usePrefersReducedMotion();
  const fine = useFinePointer();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const anim = mounted && !reduce;

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const titleY = useTransform(p, [0, 0.3], ["0%", "-30%"]);
  const titleO = useTransform(p, [0.05, 0.26], [1, 0]);
  const infoO = useTransform(p, [0, 0.1], [1, 0]);
  const midO = useTransform(p, [0.3, 0.42, 0.58, 0.68], [0, 1, 1, 0]);
  const midY = useTransform(p, [0.3, 0.68], ["6vh", "-6vh"]);
  const cityO = useTransform(p, [0.52, 0.86], [0, 1]);
  const cityY = useTransform(p, [0.52, 1], ["14%", "0%"]);
  const endO = useTransform(p, [0.78, 0.92], [0, 1]);

  return (
    <section ref={ref} id="top" data-tone="dark" aria-labelledby="hero-title" className={`relative bg-soot ${reduce ? "h-[100svh]" : "h-[280svh]"}`}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <EmberField
          progress={p}
          src={site.images.embers.src}
          aspect={site.images.embers.width / site.images.embers.height}
          className="absolute inset-0 h-full w-full"
          fallback={<Image src={site.images.embers} alt="" fill priority sizes="100vw" className="object-cover" placeholder="blur" />}
        />

        {/* legibility: a low scrim where the headline sits over the coals */}
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_18%_88%,rgba(18,14,12,0.72),transparent_70%)]" style={{ opacity: anim ? titleO : 1 }} />

        {/* the city, arriving from below as the camera lifts */}
        {!reduce && (
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[78%] [mask-image:linear-gradient(to_bottom,transparent,black_38%)]" style={{ opacity: cityO, y: cityY }}>
            <Image src={site.images.cityNight} alt="" fill sizes="100vw" className="object-cover object-bottom mix-blend-screen" />
          </motion.div>
        )}

        {/* the dictionary entry */}
        <motion.div className="wrap absolute inset-x-0 top-[5.5rem] text-ash sm:top-24" style={{ opacity: anim ? titleO : 1 }}>
          <p className="max-w-[23rem] text-[0.98rem] leading-relaxed text-ash/80">
            <span className="font-[650] text-ash">kaa</span> <span className="num text-[0.8rem] text-ash/55">/kɑː/</span> <span className="gloss text-ash/60">Swahili</span>
            <br />
            <span className="num mr-2 text-[0.75rem] text-ember">1</span>
            <span className="gloss">verb</span> to sit; to stay.
            <br />
            <span className="num mr-2 text-[0.75rem] text-ember">2</span>
            <span className="gloss">noun</span> <span className="gloss">kaa la moto</span>, a live coal.
          </p>
        </motion.div>

        {/* headline */}
        <motion.h1 id="hero-title" className="wrap pointer-events-none absolute inset-x-0 bottom-[23svh] text-ash sm:bottom-[13svh]" style={{ y: anim ? titleY : 0, opacity: anim ? titleO : 1 }}>
          <span className="sr-only">Kaa, a live-fire restaurant and bar in Westlands, Nairobi. </span>
          <span aria-hidden="true" className="d-hero block">
            {["sit by", "the fire."].map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.05em]">
                <motion.span className="block" initial={{ y: "102%" }} animate={{ y: "0%" }} transition={{ duration: 1.4, delay: 0.5 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}>
                  {l}
                </motion.span>
              </span>
            ))}
          </span>
        </motion.h1>

        {/* bottom line */}
        <motion.div className="wrap absolute inset-x-0 bottom-6 flex flex-col gap-4 text-ash sm:flex-row sm:items-end sm:justify-between" style={{ opacity: anim ? infoO : 1 }}>
          <p className="max-w-[30rem] text-[1rem] leading-snug text-ash/80">
            A live-fire kitchen and bar, {floorWords} floors above Westlands. Everything we cook touches the fire.
          </p>
          <div className="flex items-center gap-5">
            <p className="tick hidden text-ash/50 md:block" aria-hidden="true">
              {fine ? "Move over the coals" : "Drag across the coals"}
            </p>
            <button type="button" onClick={() => scrollTo("#book")} className="h-12 shrink-0 bg-ash px-6 text-[0.95rem] font-[550] text-soot transition-colors hover:bg-ember">
              Book a table
            </button>
          </div>
        </motion.div>

        {!reduce && (
          <>
            <motion.p aria-hidden="true" className="d-lg wrap pointer-events-none absolute inset-x-0 top-[38%] text-center text-ash" style={{ opacity: midO, y: midY }}>
              one fire, one long counter,
              <br />
              <span className="gloss font-[300] tracking-[-0.02em] text-ash/85">and the whole city below.</span>
            </motion.p>
            <motion.div className="wrap absolute inset-x-0 top-[30%] flex flex-col items-center gap-6 text-center text-ash" style={{ opacity: endO }}>
              <p className="d-xl">
                the fire is lit
                <br />
                at five.
              </p>
              <p className="tick text-ash/70">Tuesday to Sunday · {site.location.area}</p>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
