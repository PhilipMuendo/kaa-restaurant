/**
 * KAA — every value a restaurant would change lives here.
 *
 *  ⚠ PLACEHOLDERS: the address, phone, prices, hours, suppliers and distances
 *  are demo content for a concept brand and are labelled on screen. Replace
 *  them before launch. Photos are graded stock (see IMAGES.md).
 */
import embers from "@/assets/images/embers.jpg";
import coals from "@/assets/images/coals.jpg";
import grillFlames from "@/assets/images/grill-flames.jpg";
import ovenFire from "@/assets/images/oven-fire.jpg";
import ovenBread from "@/assets/images/oven-bread.jpg";
import chefsSmoke from "@/assets/images/chefs-smoke.jpg";
import ribs from "@/assets/images/ribs.jpg";
import fishLeaf from "@/assets/images/fish-leaf.jpg";
import vegBowl from "@/assets/images/veg-bowl.jpg";
import dessert from "@/assets/images/dessert.jpg";
import bartender from "@/assets/images/bartender.jpg";
import barNight from "@/assets/images/bar-night.jpg";
import vegGrill from "@/assets/images/veg-grill.jpg";
import platingHands from "@/assets/images/plating-hands.jpg";
import cityNight from "@/assets/images/city-night.jpg";
import terrace from "@/assets/images/terrace.jpg";
import tableCandle from "@/assets/images/table-candle.jpg";
import dinnerCandle from "@/assets/images/dinner-candle.jpg";
import firepit from "@/assets/images/firepit.jpg";
import rooftopGlass from "@/assets/images/rooftop-glass.jpg";
import chefFlame from "@/assets/images/chef-flame.jpg";

export type Diet = "v" | "vg" | "gf" | "n";
export type Dish = { name: string; note: string; price: number; diet: Diet[] };
export type Station = {
  id: string;
  name: string;
  temp: number; // °C
  line: string;
  body: string;
  image: { src: typeof embers; alt: string };
  dishes: Dish[];
};

// ── The fires & the menu ─────────────────────────────────────────────────────
export const STATIONS: Station[] = [
  {
    id: "embers",
    name: "In the embers",
    temp: 600,
    line: "Buried in the coals",
    body: "Sweet potatoes, onions, beetroot and maize go straight into the glowing bed and come out blackened outside, soft and sweet within.",
    image: { src: coals, alt: "Charcoal glowing red in the dark" },
    dishes: [
      { name: "Ember-roasted sweet potato", note: "smoked cultured butter, chilli honey", price: 950, diet: ["v", "gf"] },
      { name: "Mahindi choma", note: "charred maize, lime, pilipili butter", price: 750, diet: ["v", "gf"] },
      { name: "Coal-baked onion", note: "aged local cheese, thyme, burnt-onion oil", price: 1100, diet: ["v", "gf"] },
      { name: "Ash-roasted beetroot", note: "macadamia, mala, dill", price: 1050, diet: ["v", "gf", "n"] },
    ],
  },
  {
    id: "grill",
    name: "On the grill",
    temp: 450,
    line: "Over macadamia-shell charcoal",
    body: "The hottest place on the roof. Fish, meat and mushrooms go on the bars over charcoal pressed from macadamia shells, and come off with a crust you can hear.",
    image: { src: grillFlames, alt: "Flames rising through the bars of a charcoal grill" },
    dishes: [
      { name: "Whole Lake Victoria tilapia", note: "coconut, tamarind, kachumbari", price: 2900, diet: ["gf"] },
      { name: "Laikipia sirloin on the bone, 400 g", note: "bone-marrow sauce, charred greens", price: 5800, diet: ["gf"] },
      { name: "Kilifi prawns", note: "garlic, coconut, lime leaf", price: 3600, diet: ["gf"] },
      { name: "Chicken thighs", note: "dhania and green-chilli marinade, grilled lemon", price: 2400, diet: ["gf"] },
      { name: "Limuru oyster mushrooms", note: "miso butter, crisp ugali", price: 1900, diet: ["v"] },
    ],
  },
  {
    id: "oven",
    name: "From the oven",
    temp: 380,
    line: "Clay, stone and a wood fire",
    body: "A clay oven that never quite goes cold. Breads slapped against its walls, vegetables roasted in its mouth, everything tasting faintly of wood smoke.",
    image: { src: ovenFire, alt: "A wood fire burning inside a brick oven" },
    dishes: [
      { name: "Oven chapati", note: "ghee, wild honey, flaky salt", price: 600, diet: ["v"] },
      { name: "Flatbread", note: "whipped njahi beans, garlic oil, herbs", price: 650, diet: ["vg"] },
      { name: "Whole roast cauliflower", note: "tahini, pomegranate, toasted seeds", price: 1600, diet: ["vg", "gf"] },
    ],
  },
  {
    id: "pit",
    name: "From the pit",
    temp: 110,
    line: "Twelve hours of slow smoke",
    body: "Low and slow, overnight. Goat and beef go into the smoke pit before we close and come out the next evening, falling from the bone.",
    image: { src: chefsSmoke, alt: "A cook working over a smoking pit in a cloud of smoke" },
    dishes: [
      { name: "Goat shoulder, 12 hours", note: "kachumbari, ugali, pit juices (for two: 7,800)", price: 4200, diet: ["gf"] },
      { name: "Beef short rib", note: "coffee and tamarind glaze, pickled onion", price: 4900, diet: ["gf"] },
    ],
  },
];

export const SWEET: Dish[] = [
  { name: "Grilled pineapple", note: "rum caramel, coconut ice cream", price: 950, diet: ["v", "gf"] },
  { name: "Ember bananas", note: "honey, macadamia crumble", price: 900, diet: ["v", "n"] },
  { name: "Smoked chocolate pot", note: "Nyeri coffee cream, smoked salt", price: 1100, diet: ["v", "gf"] },
];

export const TASTING = {
  name: "Kaa la moto",
  body: "Seven courses from every fire, served at the counter.",
  price: 9500,
  pairing: 6000,
};

// ── The bar ──────────────────────────────────────────────────────────────────
export type Glass = "rocks" | "coupe" | "martini" | "highball";
export type Drink = {
  name: string;
  glass: Glass;
  price: number;
  zero?: boolean;
  note: string;
  layers: { label: string; ml: number; color: string }[];
};

export const DRINKS: Drink[] = [
  {
    name: "Rosella Negroni",
    glass: "rocks",
    price: 1400,
    note: "Gin steeped with dried hibiscus, bitter and deep red.",
    layers: [
      { label: "Hibiscus gin", ml: 30, color: "#7E1424" },
      { label: "Campari", ml: 30, color: "#B4202F" },
      { label: "Tamarind vermouth", ml: 30, color: "#5E2418" },
    ],
  },
  {
    name: "Dawa, re-lit",
    glass: "rocks",
    price: 1200,
    note: "Nairobi's own cocktail, with ginger charred on the grill.",
    layers: [
      { label: "Vodka", ml: 50, color: "#E9E4D8" },
      { label: "Lime", ml: 20, color: "#CFD98A" },
      { label: "Wild honey", ml: 15, color: "#E0A43A" },
      { label: "Charred ginger", ml: 10, color: "#B9873F" },
    ],
  },
  {
    name: "Smoke & honey",
    glass: "coupe",
    price: 1300,
    note: "Rum, Baringo honey and lime, finished under a glass of smoke.",
    layers: [
      { label: "Smoked rum", ml: 50, color: "#9A5A22" },
      { label: "Baringo honey", ml: 15, color: "#E3A63B" },
      { label: "Lime", ml: 25, color: "#D4DB8F" },
    ],
  },
  {
    name: "Baobab sour",
    glass: "coupe",
    price: 1300,
    note: "Tart baobab, gin and lemon under a soft foam.",
    layers: [
      { label: "Gin", ml: 45, color: "#ECE6D6" },
      { label: "Baobab", ml: 20, color: "#E4CDA0" },
      { label: "Lemon", ml: 25, color: "#E6DC8C" },
      { label: "Foam", ml: 20, color: "#F6F1E6" },
    ],
  },
  {
    name: "Tamarind old fashioned",
    glass: "rocks",
    price: 1500,
    note: "Bourbon, tamarind and bitters over one big cube.",
    layers: [
      { label: "Bourbon", ml: 60, color: "#9C4F1D" },
      { label: "Tamarind", ml: 10, color: "#5A2A14" },
      { label: "Bitters", ml: 3, color: "#3A1810" },
    ],
  },
  {
    name: "Coffee & cardamom",
    glass: "martini",
    price: 1400,
    note: "Cold brew from Nyeri, vodka and green cardamom.",
    layers: [
      { label: "Vodka", ml: 40, color: "#E8E2D4" },
      { label: "Nyeri cold brew", ml: 40, color: "#2E1A12" },
      { label: "Cardamom", ml: 15, color: "#B79A62" },
    ],
  },
  {
    name: "Rosella & tonic",
    glass: "highball",
    price: 650,
    zero: true,
    note: "Hibiscus cordial, tonic and a lime wheel. No alcohol.",
    layers: [
      { label: "Hibiscus cordial", ml: 60, color: "#9E1A33" },
      { label: "Tonic", ml: 140, color: "#E7D6D2" },
    ],
  },
  {
    name: "Ginger dawa",
    glass: "highball",
    price: 600,
    zero: true,
    note: "Everything good about a dawa, without the vodka.",
    layers: [
      { label: "Charred ginger", ml: 40, color: "#B9873F" },
      { label: "Lime", ml: 20, color: "#CFD98A" },
      { label: "Honey", ml: 15, color: "#E0A43A" },
      { label: "Soda", ml: 110, color: "#ECE7DC" },
    ],
  },
];

// ── Where it comes from ──────────────────────────────────────────────────────
export const SUPPLY = [
  { item: "Greens & herbs", from: "Kiambu", km: 20 },
  { item: "Oyster mushrooms", from: "Limuru", km: 30 },
  { item: "Goat", from: "Kajiado", km: 85 },
  { item: "Macadamia-shell charcoal", from: "Murang'a", km: 85 },
  { item: "Coffee", from: "Nyeri", km: 150 },
  { item: "Beef", from: "Nanyuki, Laikipia", km: 200 },
  { item: "Wild honey", from: "Kabarnet, Baringo", km: 280 },
  { item: "Maize flour", from: "Eldoret", km: 310 },
  { item: "Tilapia", from: "Dunga beach, Kisumu", km: 350 },
  { item: "Prawns", from: "Kilifi", km: 560 },
];

// ── The week ─────────────────────────────────────────────────────────────────
// Times are minutes from midnight in Nairobi time; values past 1440 run past midnight.
export type Block = { kind: "kitchen" | "bar" | "music" | "lunch"; from: number; to: number; label: string };
export type Day = { day: string; short: string; title: string; note: string; blocks: Block[] };
const t = (h: number, m = 0) => h * 60 + m;
export const WEEK: Day[] = [
  { day: "Monday", short: "Mon", title: "The fire rests", note: "Closed. The pit is filled for the week.", blocks: [] },
  {
    day: "Tuesday",
    short: "Tue",
    title: "Dinner",
    note: "The counter is quietest tonight.",
    blocks: [
      { kind: "bar", from: t(17), to: t(23, 30), label: "Bar" },
      { kind: "kitchen", from: t(17, 30), to: t(22, 30), label: "Kitchen" },
    ],
  },
  {
    day: "Wednesday",
    short: "Wed",
    title: "Dinner",
    note: "Tasting menu at the counter.",
    blocks: [
      { kind: "bar", from: t(17), to: t(23, 30), label: "Bar" },
      { kind: "kitchen", from: t(17, 30), to: t(22, 30), label: "Kitchen" },
    ],
  },
  {
    day: "Thursday",
    short: "Thu",
    title: "Dinner",
    note: "Whole fish night: whatever came off the boats.",
    blocks: [
      { kind: "bar", from: t(17), to: t(23, 30), label: "Bar" },
      { kind: "kitchen", from: t(17, 30), to: t(22, 30), label: "Kitchen" },
    ],
  },
  {
    day: "Friday",
    short: "Fri",
    title: "Fire & vinyl",
    note: "Records from nine until late.",
    blocks: [
      { kind: "bar", from: t(17), to: t(25), label: "Bar" },
      { kind: "kitchen", from: t(17, 30), to: t(22, 30), label: "Kitchen" },
      { kind: "music", from: t(21), to: t(25), label: "Vinyl" },
    ],
  },
  {
    day: "Saturday",
    short: "Sat",
    title: "Long lunch, late night",
    note: "Lunch in the sun, records after dark.",
    blocks: [
      { kind: "bar", from: t(12, 30), to: t(25), label: "Bar" },
      { kind: "lunch", from: t(12, 30), to: t(15, 30), label: "Lunch" },
      { kind: "kitchen", from: t(17, 30), to: t(22, 30), label: "Kitchen" },
      { kind: "music", from: t(21), to: t(25), label: "Vinyl" },
    ],
  },
  {
    day: "Sunday",
    short: "Sun",
    title: "Nyama Sunday",
    note: "A whole goat on the pit, served until it's gone.",
    blocks: [
      { kind: "bar", from: t(12, 30), to: t(20), label: "Bar" },
      { kind: "lunch", from: t(12, 30), to: t(18), label: "Nyama lunch" },
    ],
  },
];

// ── Booking ──────────────────────────────────────────────────────────────────
export type Zone = { id: "counter" | "edge" | "pit" | "chef"; name: string; seats: string; max: number; min?: number; body: string; image: { src: typeof embers; alt: string } };
export const ZONES: Zone[] = [
  { id: "counter", name: "The counter", seats: "12 stools at the hearth", max: 4, body: "Front row at the fire. Watch every plate come off the grill.", image: { src: chefFlame, alt: "A cook working over a burst of flame at the grill" } },
  { id: "edge", name: "The edge", seats: "8 tables on the west parapet", max: 6, body: "The city eleven floors below and the sunset straight ahead.", image: { src: terrace, alt: "A rooftop terrace with lounge seating and the city lit up at night" } },
  { id: "pit", name: "The fire pit", seats: "3 low sofas round the fire", max: 8, body: "Drinks and small plates around an open fire.", image: { src: firepit, alt: "A fire pit burning against a stone wall at night" } },
  { id: "chef", name: "Chef's table", seats: "One table for 6–10", min: 6, max: 10, body: "A private room facing the hearth, with a menu cooked for you.", image: { src: tableCandle, alt: "A dim private dining room lit by a single candle" } },
];

/** Bookable tables, positioned on the roof plan (viewBox 0 0 1000 640). */
export type Table = { id: string; zone: Zone["id"]; seats: number; x: number; y: number; shape: "stool" | "round" | "square" | "sofa" | "long"; r?: number };
export const TABLES: Table[] = [
  // counter: 12 stools in an arc facing the hearth
  ...Array.from({ length: 12 }, (_, i): Table => {
    const a = Math.PI * (0.16 + (i / 11) * 0.68);
    return { id: `C${i + 1}`, zone: "counter", seats: 1, x: Math.round(560 - Math.cos(a) * 190), y: Math.round(250 + Math.sin(a) * 150), shape: "stool", r: Math.round(((a * 180) / Math.PI) * 10) / 10 };
  }),
  // edge: along the west parapet (left), facing out
  { id: "E1", zone: "edge", seats: 2, x: 92, y: 110, shape: "square" },
  { id: "E2", zone: "edge", seats: 2, x: 92, y: 185, shape: "square" },
  { id: "E3", zone: "edge", seats: 4, x: 92, y: 270, shape: "square" },
  { id: "E4", zone: "edge", seats: 4, x: 92, y: 360, shape: "square" },
  { id: "E5", zone: "edge", seats: 6, x: 92, y: 460, shape: "square" },
  { id: "E6", zone: "edge", seats: 2, x: 180, y: 560, shape: "round" },
  { id: "E7", zone: "edge", seats: 4, x: 270, y: 560, shape: "round" },
  { id: "E8", zone: "edge", seats: 2, x: 360, y: 560, shape: "round" },
  // fire pit lounge
  { id: "P1", zone: "pit", seats: 6, x: 808, y: 470, shape: "sofa", r: 0 },
  { id: "P2", zone: "pit", seats: 8, x: 900, y: 545, shape: "sofa", r: 90 },
  { id: "P3", zone: "pit", seats: 4, x: 808, y: 600, shape: "sofa", r: 180 },
  // chef's table
  { id: "CT", zone: "chef", seats: 10, x: 860, y: 150, shape: "long" },
];

export const BOOKING = {
  daysAhead: 21,
  lunchDays: [6, 0], // Sat, Sun (JS getDay)
  dinnerDays: [2, 3, 4, 5, 6], // Tue–Sat
  closedDays: [1], // Mon
  lunchSlots: ["12:30", "13:00", "13:30", "14:00", "14:30"],
  dinnerSlots: ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"],
  maxParty: 10,
};

// ── Site ─────────────────────────────────────────────────────────────────────
export const site = {
  name: "Kaa",
  wordmark: "kaa",
  tagline: "A live-fire kitchen and bar, eleven floors above Westlands",
  url: "https://kaa-restaurant.vercel.app",
  placeholders: true,

  brand: {
    soot: "#120E0C",
    char: "#1E1815",
    ash: "#ECE4D8",
    ash2: "#DED4C5",
    smoke: "#93887C",
    ember: "#FF6B2C",
  },

  location: {
    floor: 11, // placeholder
    address: "Level 11, [Building name], Westlands, Nairobi", // placeholder
    area: "Westlands, Nairobi",
    lat: -1.2648,
    lon: 36.8027,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Westlands%2C+Nairobi", // placeholder
    gettingHere: [
      { k: "Lift", v: "Straight to level 11 from the ground-floor lobby." },
      { k: "Parking", v: "Basement levels B1–B2. We validate your ticket." },
      { k: "Ride-hail", v: "Drop-off at the main entrance, pickups from the same spot." },
      { k: "Dress", v: "Smart casual. Bring a layer: we're 1,700 m up and evenings get cool." },
    ],
  },

  contact: {
    phone: "+254 700 000 000", // placeholder
    phoneHref: "tel:+254700000000",
    whatsapp: "254700000000", // placeholder
    email: "table@example.com", // placeholder
    instagram: "https://www.instagram.com/",
  },

  seo: {
    title: "Kaa | Live-fire restaurant & bar on a Westlands rooftop, Nairobi",
    description:
      "Kaa is a live-fire kitchen and bar eleven floors above Westlands, Nairobi. Food cooked in embers, over charcoal, in a clay oven and a smoke pit, cocktails with Kenyan ingredients, and sunset over the city. Book a table online.",
    keywords: [
      "rooftop restaurant Nairobi",
      "Westlands restaurant",
      "best restaurants Nairobi",
      "nyama choma Nairobi",
      "live fire restaurant",
      "cocktail bar Westlands",
      "private dining Nairobi",
      "sunset dinner Nairobi",
    ],
  },

  images: {
    embers,
    cityNight,
    rooftopGlass,
    bartender,
    barNight,
    dinnerCandle,
    platingHands,
    vegGrill,
    fishLeaf,
    vegBowl,
    dessert,
    ovenBread,
    ribs,
  },
} as const;

export const formatKES = (n: number) => n.toLocaleString("en-KE");
