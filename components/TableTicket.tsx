"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ZONES } from "@/config/site";
import { useBooking } from "@/lib/booking";
import { useScrollTo } from "@/lib/smooth-scroll";
import { dayLabel } from "./Book";

/*
 * Once you've started a booking, it follows you down the page as a small
 * kitchen ticket, so you can browse the menu and come back to finish.
 */
export default function TableTicket() {
  const { draft, done } = useBooking();
  const scrollTo = useScrollTo();
  const [bookVisible, setBookVisible] = useState(true);
  useEffect(() => {
    const el = document.getElementById("book");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBookVisible(e.isIntersecting), { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const show = !!draft.date && !done && !bookVisible;
  const zone = ZONES.find((z) => z.id === draft.zone);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={() => scrollTo("#book")}
          initial={{ y: 120, rotate: 0 }}
          animate={{ y: 0, rotate: -1.2 }}
          exit={{ y: 140 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="receipt fixed bottom-4 right-4 z-[80] w-[15.5rem] px-5 py-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          aria-label="Your table: finish booking"
        >
          <span className="num block text-[0.62rem] uppercase tracking-[0.1em] text-[#1b1714]/55">Your table</span>
          <span className="num mt-1 block text-[0.82rem] uppercase leading-snug tracking-[0.04em]">
            {draft.party} {draft.party === 1 ? "cover" : "covers"} · {dayLabel(draft.date!)}
            {draft.time ? ` · ${draft.time}` : ""}
            {zone ? <span className="block">{zone.name}</span> : null}
          </span>
          <span className="mt-2 block text-[0.9rem] font-[600]">Finish booking →</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
