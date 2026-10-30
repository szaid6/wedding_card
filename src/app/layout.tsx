import type { Metadata, Viewport } from "next";
import { Amiri, Aref_Ruqaa, Cinzel, Cormorant_Garamond, EB_Garamond, Pinyon_Script } from "next/font/google";
import "./globals.css";

// Inscription capitals for headings, a flowing script for names, Garamond for reading.
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["400", "500", "600"] });
const pinyon = Pinyon_Script({ variable: "--font-pinyon", subsets: ["latin"], weight: "400" });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});
const garamond = EB_Garamond({ variable: "--font-garamond", subsets: ["latin"], weight: ["400", "500"] });
// Arabic: Ruqʿah calligraphy for names and headings, Naskh for everything else (and the Bismillah).
// Not preloaded: Aref Ruqaa is only fetched once a page switches to Arabic.
const arefRuqaa = Aref_Ruqaa({
  variable: "--font-aref-ruqaa",
  subsets: ["arabic"],
  weight: ["400", "700"],
  preload: false,
});
const amiri = Amiri({ variable: "--font-amiri", subsets: ["arabic"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Zaid & Zikra - Wedding Invitation",
  description: "You're invited to celebrate the wedding of Zaid & Zikra.",
};

export const viewport: Viewport = {
  themeColor: "#0f3d33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={[cinzel, pinyon, cormorant, garamond, arefRuqaa, amiri].map((f) => f.variable).join(" ")}
    >
      <body>{children}</body>
    </html>
  );
}
