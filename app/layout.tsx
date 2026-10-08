import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Martian_Mono, Newsreader } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";
import { site, WEEK, STATIONS, SWEET } from "@/config/site";
import { SmoothScroll } from "@/lib/smooth-scroll";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-bricolage", display: "swap" });
const martian = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-martian", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["italic"], axes: ["opsz"], variable: "--font-newsreader", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.title, template: `%s | ${site.name}` },
  description: site.seo.description,
  keywords: [...site.seo.keywords],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: site.name, title: site.seo.title, description: site.seo.description, locale: "en_KE" },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: site.brand.soot, width: "device-width", initialScale: 1 };

const DAY_IDS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const prices = [...STATIONS.flatMap((s) => s.dishes), ...SWEET].map((d) => d.price);
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: site.name,
  description: site.seo.description,
  url: site.url,
  servesCuisine: ["Kenyan", "Live-fire", "Grill"],
  priceRange: `KES ${Math.min(...prices).toLocaleString("en-KE")}–${Math.max(...prices).toLocaleString("en-KE")}`,
  acceptsReservations: true,
  telephone: site.contact.phone,
  address: { "@type": "PostalAddress", streetAddress: site.location.address, addressLocality: "Nairobi", addressCountry: "KE" },
  geo: { "@type": "GeoCoordinates", latitude: site.location.lat, longitude: site.location.lon },
  openingHoursSpecification: WEEK.flatMap((d, i) => {
    const bar = d.blocks.find((b) => b.kind === "bar");
    return bar ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: DAY_IDS[(i + 1) % 7], opens: hm(bar.from), closes: hm(bar.to) }] : [];
  }),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const vars = {
    "--brand-soot": site.brand.soot,
    "--brand-char": site.brand.char,
    "--brand-ash": site.brand.ash,
    "--brand-ash2": site.brand.ash2,
    "--brand-smoke": site.brand.smoke,
    "--brand-ember": site.brand.ember,
  } as CSSProperties;
  return (
    <html lang="en" className={`${bricolage.variable} ${martian.variable} ${newsreader.variable}`} style={vars}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
