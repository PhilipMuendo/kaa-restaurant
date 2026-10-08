# Kaa: a live-fire restaurant on a Westlands rooftop

A website for a live-fire kitchen and bar in Nairobi. **Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 ·
Motion · Lenis**, with a hand-written WebGL ember shader.

> *kaa* (Swahili): **1.** to sit; to stay. **2.** *kaa la moto*, a live coal. Kaa is an original concept brand.
> Every value a restaurant would change lives in **`config/site.ts`**; the address, phone, prices, hours and
> suppliers are placeholders and say so on screen. Photos are replaceable stock (see `IMAGES.md`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## The idea: *everything touches the fire*

| Section | What happens |
|---|---|
| **Header** | The full stop in the wordmark is a live coal: it glows while the restaurant is open (real Nairobi time) and goes grey when it's closed. The bar also shows today's status and tonight's sunset. The mobile menu opens as a printed menu card. |
| **Hero** | A photograph of live coals brought to life in WebGL: the glow breathes, heat shimmers, sparks rise and drift, and your cursor (or finger) is breath on the coals, making them flare. Scroll and the camera lifts with the sparks until the coals are gone and Nairobi is below. |
| **The fire** | Four places on the roof at four heats. A thermometer follows you down the page and the mercury moves to each station's temperature. |
| **The menu** | Set like the printed card: grouped by fire, priced in KES, marked for diets. Filter to vegetarian, vegan, no gluten or no nuts and everything else steps back. The tasting menu books the counter directly. |
| **The bar** | Choose a drink and it's poured: the glass fills layer by layer in the real proportions, labelled in ml. Cocktails / zero-proof switch. |
| **Supply ticket** | Where everything comes from, printed as a kitchen receipt: supplier, town, kilometres. |
| **The week** | A timetable of the week: kitchen, bar, records. Today is marked with a live "now" line; "Book Fri" jumps to the booking with that day chosen. |
| **Book a table** | The centrepiece. A plan of the roof drawn from above. Choose party size, night and time, and every table shows free or taken. Pick a zone or point at the exact table (counter seats are found as runs of free stools for your party). Sunset is calculated for the chosen date and golden-hour slots are marked. Confirmation prints as a kitchen docket with a calendar file (.ics) and WhatsApp. While a booking is in progress, a small ticket follows you down the page. |
| **Private dining** | The chef's table for 6–10; one tap pre-fills the booking. |
| **Find us** | Address, maps, getting up there, what to wear, and the week's hours with today in bold. |
| **Footer** | Westlands at night in silhouette, with one floor near the top of one tower lit: us. |

## Make it a real restaurant

| What | Where |
|---|---|
| Name, tagline, domain | `config/site.ts` → `site` |
| Address, floor, map link, getting here | `config/site.ts` → `site.location` |
| Phone, **WhatsApp**, email, Instagram | `config/site.ts` → `site.contact` |
| Colours | `config/site.ts` → `site.brand` |
| Menu (stations, dishes, diets, prices), tasting menu | `config/site.ts` → `STATIONS`, `SWEET`, `TASTING` |
| Drinks (glass, layers in ml, colours) | `config/site.ts` → `DRINKS` |
| Suppliers | `config/site.ts` → `SUPPLY` |
| Opening hours | `config/site.ts` → `WEEK` (drives the header status, the timetable, Find us and the JSON-LD) |
| Seating plan, booking slots | `config/site.ts` → `ZONES`, `TABLES`, `BOOKING` |
| **Availability** | `lib/booking.tsx` → `taken()` is a deterministic demo. Replace with your reservation system's availability API. |
| Booking requests | set `BOOKING_WEBHOOK_URL` (reservation system, CRM, Zapier/Make, Slack). Without it, requests are only logged (no personal data in logs). |
| Photography | `assets/images/` (same filename = no code change), then `python scripts/grade.py` |
| Link preview image | `app/opengraph-image.jpg` (1200×630 JPEG; keep it under ~300 KB so WhatsApp shows it) and its alt text in `app/opengraph-image.alt.txt` |

## Accessibility & performance

- The ember shader renders below native resolution, only while visible and the tab is active, and falls back to the photograph if WebGL fails.
- `prefers-reduced-motion`: no scroll-driven lift (a still frame of the coals instead), Lenis off, the receipt is already printed, number tweens jump.
- Every table on the plan is a keyboard-operable button with a full label; the zone list offers the same choices without the plan.
- Semantic landmarks, one `h1`, skip link, focus-trapped mobile menu (Esc closes), native radios behind every chip, labelled form errors with focus moved to the first one, live regions for status and results.
- Times are computed in Nairobi time (UTC+3) whatever the visitor's own time zone; time-dependent parts render after hydration to avoid mismatches.
- The homepage is statically prerendered; only `/api/book` is dynamic.
