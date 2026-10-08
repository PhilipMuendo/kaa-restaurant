"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { hhmm, status, sunset, useNow } from "@/lib/time";
import { useLenis, useScrollTo } from "@/lib/smooth-scroll";

/*
 * The full stop in the wordmark is a live coal: it glows while the fire is
 * lit (real Nairobi time) and goes grey when we're closed. The menu opens as
 * a printed menu card: the page's sections listed like courses.
 */

export const SECTIONS = [
  { id: "fire", label: "The fire", note: "four heats" },
  { id: "menu", label: "The menu", note: "tonight" },
  { id: "bar", label: "The bar", note: "drinks" },
  { id: "week", label: "The week", note: "what's on" },
  { id: "book", label: "Book a table", note: "pull up a chair" },
  { id: "private", label: "Private dining", note: "up to ten" },
  { id: "visit", label: "Find us", note: "level 11" },
];

export function Coal({ lit, className = "" }: { lit: boolean | null; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full transition-[background-color,box-shadow] duration-700 ${className} ${
        lit ? "animate-[coal_3.2s_ease-in-out_infinite] bg-ember shadow-[0_0_10px_2px_rgba(255,107,44,0.65)]" : "bg-smoke/60"
      }`}
    />
  );
}

export default function Nav() {
  const scrollTo = useScrollTo();
  const lenis = useLenis();
  const now = useNow();
  const st = now ? status(now) : null;
  const set = now ? sunset(now.y, now.m, now.d) : null;
  const [tone, setTone] = useState<"dark" | "light">("dark");
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    const d = v - last.current;
    if (Math.abs(d) > 6) {
      setHidden(d > 0 && v > window.innerHeight * 2.4);
      last.current = v;
    }
    setSolid(v > window.innerHeight * 0.5);
  });

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-tone]"));
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setTone(((e.target as HTMLElement).dataset.tone as "dark" | "light") ?? "dark")), {
      rootMargin: "0px 0px -94% 0px",
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    card.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !card.current) return;
      const items = [trigger.current, ...Array.from(card.current.querySelectorAll<HTMLElement>("a,button"))].filter(Boolean) as HTMLElement[];
      const first = items[0], lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger.current?.focus();
    };
  }, [open, lenis]);

  const go = (id: string) => {
    const was = open;
    setOpen(false);
    window.setTimeout(() => scrollTo(id === "top" ? 0 : `#${id}`), was ? 380 : 0);
  };
  const light = (tone === "light" && solid) || open;

  return (
    <>
      <a href="#book" className="fixed left-3 top-3 z-[120] -translate-y-24 bg-ember px-4 py-2 text-soot focus:translate-y-0">
        Skip to booking
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-[90] transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${hidden && !open ? "-translate-y-full" : ""} ${
          open ? "text-soot" : light ? "bg-ash/90 text-soot backdrop-blur-md" : solid ? "bg-soot/80 text-ash backdrop-blur-md" : "text-ash"
        }`}
      >
        <div className="wrap flex h-16 items-center justify-between gap-6">
          <button type="button" onClick={() => go("top")} className="flex items-baseline text-[1.75rem] font-[650] leading-none tracking-[-0.05em] [font-variation-settings:'opsz'_48,'wdth'_90]" aria-label={`${site.name}, back to the top`}>
            {site.wordmark}
            <Coal lit={st ? st.open : null} className="ml-[0.06em] h-[0.2em] w-[0.2em]" />
          </button>

          <p className="tick hidden items-center gap-4 opacity-80 lg:flex" aria-live="polite">
            <span>{st ? st.text : " "}</span>
            {set !== null && (
              <span className="flex items-center gap-1.5 opacity-70">
                <SunGlyph /> Sunset {hhmm(set)}
              </span>
            )}
          </p>

          <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
            <ul className="hidden items-center gap-6 pr-4 text-[0.92rem] xl:flex">
              {SECTIONS.filter((s) => ["menu", "bar", "week", "private"].includes(s.id)).map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(s.id);
                    }}
                    className="opacity-75 transition-opacity hover:opacity-100"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => go("book")} className={`h-10 px-4 text-[0.9rem] font-[550] transition-colors sm:px-5 ${light ? "bg-soot text-ash hover:bg-ember hover:text-soot" : "bg-ash text-soot hover:bg-ember"}`}>
              Book
              <span className="hidden sm:inline"> a table</span>
            </button>
            <button ref={trigger} type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu-card" className="tick flex h-10 items-center gap-2 px-3 xl:hidden">
              {open ? "Close" : "Menu"}
            </button>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-card"
            ref={card}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="paper fixed inset-0 z-[85] flex flex-col overflow-y-auto px-[var(--gutter)] pb-8 pt-24"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
            data-lenis-prevent
          >
            <p className="gloss text-center text-[1.05rem] text-soot/60">— tonight —</p>
            <ol className="mx-auto mt-6 w-full max-w-xl">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(s.id);
                    }}
                    className="group flex items-baseline gap-3 py-3"
                  >
                    <span className="d-md group-hover:text-ember">{s.label}</span>
                    <span className="gloss hidden text-soot/55 sm:inline">{s.note}</span>
                    <span className="leader" />
                    <span className="num text-[0.85rem] text-soot/60">{["i", "ii", "iii", "iv", "v", "vi", "vii"][i]}</span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="mx-auto mt-auto w-full max-w-xl pt-10 text-center">
              <p className="tick flex items-center justify-center gap-2 text-soot/70">
                <Coal lit={st ? st.open : null} className="h-2 w-2" />
                {st?.text}
              </p>
              <p className="mt-3 text-[0.95rem] text-soot/70">
                <a href={site.contact.phoneHref} className="underline decoration-soot/30 underline-offset-4">
                  {site.contact.phone}
                </a>
                {" · "}
                <a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="underline decoration-soot/30 underline-offset-4">
                  WhatsApp
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SunGlyph({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 11h12M4.5 11a3.5 3.5 0 0 1 7 0" />
      <path d="M8 3.5v2M3.4 5.6l1.3 1.3M12.6 5.6l-1.3 1.3" />
    </svg>
  );
}
