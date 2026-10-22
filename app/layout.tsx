import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Cinzel,
  Cormorant_Garamond,
  Great_Vibes,
  Outfit,
  Tiro_Devanagari_Hindi,
} from "next/font/google";
import { AmbientMusic } from "@/components/audio/ambient-music";
import { KesariOpening } from "@/components/loader/kesari-opening";
import "./globals.css";

const casOlgans = localFont({
  src: "./fonts/CasOlgans-Regular.woff2",
  variable: "--font-cas-olgans",
  display: "swap",
  weight: "400",
  style: "normal",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

const tiro = Tiro_Devanagari_Hindi({
  variable: "--font-tiro",
  subsets: ["devanagari", "latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Kesari by Bhumika Patel",
    template: "%s · Kesari",
  },
  description:
    "An atelier of hand-worked cloth — resham, zardozi, ari, cutdana and pitta tiki — by Bhumika Patel.",
  icons: {
    icon: "/images/logo.png",
  },
};

/** Temporary bare layout for facade hero preview + opening loader. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${casOlgans.variable} ${cinzel.variable} ${cormorant.variable} ${outfit.variable} ${script.variable} ${tiro.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-y-auto bg-[#efe4cc]">
        <KesariOpening />
        {children}
        <AmbientMusic />
      </body>
    </html>
  );
}
