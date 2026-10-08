"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { site } from "@/config/site";
import { useBooking } from "@/lib/booking";
import { useScrollTo } from "@/lib/smooth-scroll";

export default function Private() {
  const ref = useRef<HTMLElement>(null);
  const { set } = useBooking();
  const scrollTo = useScrollTo();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} id="private" data-tone="dark" aria-labelledby="pd-title" className="relative overflow-hidden bg-soot">
      <div className="grid grid-cols-1 lg:min-h-[100svh] lg:grid-cols-2">
        <div className="relative min-h-[60svh] overflow-hidden">
          <motion.div className="absolute -inset-y-[10%] inset-x-0" style={{ y }}>
            <Image src={site.images.dinnerCandle} alt="A group sharing dinner by candlelight in a dim room" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" placeholder="blur" />
          </motion.div>
        </div>
        <div className="wrap flex flex-col justify-center py-[12vh] lg:pl-16">
          <p className="gloss text-[1.15rem] text-ember">Private dining</p>
          <h2 id="pd-title" className="d-xl mt-3">
            the chef&apos;s
            <br />
            table.
          </h2>
          <p className="body mt-8 max-w-[40ch] text-ash/75">
            Up to ten of you in a glass room facing the hearth, with a menu cooked for your table and a cook to talk you through it. For more, take the whole roof: up to eighty standing.
          </p>
          <dl className="mt-10 grid max-w-md grid-cols-2 gap-y-5 border-t border-ash/15 pt-6">
            {[
              ["Guests", "6 to 10"],
              ["From", "KES 12,000 a head*"],
              ["Whole roof", "Up to 80"],
              ["Notice", "48 hours"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="tick text-ash/50">{k}</dt>
                <dd className="mt-1 text-[1.05rem]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                set({ party: 8, zone: "chef", table: null });
                scrollTo("#book");
              }}
              className="h-12 bg-ash px-6 text-[0.95rem] font-[550] text-soot transition-colors hover:bg-ember"
            >
              Book the chef&apos;s table
            </button>
            <a
              href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent("Hello Kaa, I'd like to talk about a private event.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center border border-ash/40 px-6 text-[0.95rem] transition-colors hover:border-ash"
            >
              Talk to us about an event
            </a>
          </div>
          <p className="tick mt-6 text-ash/40">*Placeholder price.</p>
        </div>
      </div>
    </section>
  );
}
