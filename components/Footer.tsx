"use client";

import { site } from "@/config/site";
import { useScrollTo } from "@/lib/smooth-scroll";
import { SECTIONS } from "./Nav";

/*
 * The footer is the view back: Westlands at night in silhouette, every
 * window dark but one floor near the top of one tower, which is us.
 */

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

const W = 1440, H = 240, OURS = 7;
const BUILDINGS = (() => {
  const r = rng(11);
  const out: { x: number; w: number; h: number; floors: number }[] = [];
  let x = -10;
  let i = 0;
  while (x < W) {
    const w = Math.round(40 + r() * 70);
    const tall = i === OURS ? 1 : r();
    const h = Math.round(i === OURS ? 205 : 40 + tall * tall * 150);
    out.push({ x, w: i === OURS ? 74 : w, h, floors: Math.max(3, Math.round(h / 12)) });
    x += (i === OURS ? 74 : w) + Math.round(r() * 6);
    i++;
  }
  return out;
})();

function Skyline() {
  const ours = BUILDINGS[OURS];
  const floorH = ours.h / 16;
  const litY = H - floorH * site.location.floor - floorH;
  const r = rng(5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="block h-[34vw] max-h-[240px] min-h-[120px] w-full" aria-hidden="true">
      <defs>
        <filter id="lit-glow" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id="sky-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120E0C" stopOpacity="0" />
          <stop offset="1" stopColor="#0B0908" />
        </linearGradient>
      </defs>
      {BUILDINGS.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={H - b.h} width={b.w} height={b.h} fill={i === OURS ? "#2A211C" : "#211A16"} />
          {/* a few windows still on, dim */}
          {i !== OURS &&
            Array.from({ length: Math.floor(b.floors / 2) }).map((_, k) =>
              r() > 0.82 ? <rect key={k} x={b.x + 6 + Math.floor(r() * (b.w - 16))} y={H - b.h + 8 + k * 24} width="5" height="3" fill="#ECE4D8" fillOpacity={0.12 + r() * 0.12} /> : null,
            )}
        </g>
      ))}
      <rect x="0" y={H * 0.55} width={W} height={H * 0.45} fill="url(#sky-fade)" />
      {/* us */}
      <rect x={ours.x - 6} y={litY - 2} width={ours.w + 12} height={floorH + 4} fill="#FF6B2C" opacity="0.55" filter="url(#lit-glow)" />
      <rect x={ours.x} y={litY} width={ours.w} height={floorH} fill="#FF8A4C" />
      <line x1={ours.x + ours.w + 6} x2={ours.x + ours.w + 60} y1={litY + floorH / 2} y2={litY + floorH / 2} stroke="#ECE4D8" strokeOpacity="0.5" />
      <text x={ours.x + ours.w + 66} y={litY + floorH / 2 + 4} fontSize="12" fill="#ECE4D8" className="font-mono" letterSpacing="1.5">
        KAA · LEVEL {site.location.floor}
      </text>
    </svg>
  );
}

export default function Footer() {
  const scrollTo = useScrollTo();
  return (
    <footer data-tone="dark" className="relative bg-soot pt-[14vh] text-ash">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-[clamp(3.4rem,6vw,5.5rem)] font-[650] leading-[0.8] tracking-[-0.06em] [font-variation-settings:'opsz'_96,'wdth'_90]">
            {site.wordmark}
            <span className="text-ember">.</span>
          </p>
          <p className="gloss mt-5 max-w-[26ch] text-[1.25rem] text-ash/70">the fire is lit, Tuesday to Sunday, at five.</p>
          <button type="button" onClick={() => scrollTo("#book")} className="mt-8 h-12 bg-ash px-6 text-[0.95rem] font-[550] text-soot transition-colors hover:bg-ember">
            Book a table
          </button>
        </div>
        <nav aria-label="Footer" className="lg:col-span-3">
          <p className="tick text-ash/45">On this page</p>
          <ul className="mt-4 space-y-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(`#${s.id}`);
                  }}
                  className="text-[1rem] text-ash/80 transition-colors hover:text-ember"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-4">
          <p className="tick text-ash/45">Visit</p>
          <address className="mt-4 text-[1rem] not-italic leading-relaxed text-ash/80">
            {site.location.address}
            <br />
            <a href={site.contact.phoneHref} className="hover:text-ember">
              {site.contact.phone}
            </a>
            <br />
            <a href={`mailto:${site.contact.email}`} className="hover:text-ember">
              {site.contact.email}
            </a>
          </address>
          <p className="mt-5 flex gap-5 text-[1rem]">
            <a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-ash/80 underline decoration-ash/30 underline-offset-4 hover:text-ember">
              WhatsApp
            </a>
            <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer" className="text-ash/80 underline decoration-ash/30 underline-offset-4 hover:text-ember">
              Instagram
            </a>
          </p>
        </div>
      </div>
      <div className="mt-[10vh]">
        <Skyline />
      </div>
      <div className="wrap tick flex flex-col gap-2 bg-[#0B0908] pb-8 pt-4 text-ash/40 md:flex-row md:justify-between">
        <p>© 2026 Kaa · A concept brand: address, prices, hours and contacts are placeholders.</p>
        <p>Photographs are illustrative stock · credits in IMAGES.md</p>
      </div>
    </footer>
  );
}
