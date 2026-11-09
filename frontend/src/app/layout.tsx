import type { Metadata } from "next";
import localFont from "next/font/local";
import { Great_Vibes, Jost } from "next/font/google";
import { Suspense } from "react";
import IntroSplash from "@/components/IntroSplash";
import SiteTheme from "@/components/SiteTheme";
import SiteWhatsApp from "@/components/SiteWhatsApp";
import SmoothScroll from "@/components/SmoothScroll";
import StorefrontOnly from "@/components/StorefrontOnly";
import { BagWishlistProvider } from "@/context/BagWishlistContext";
import "lenis/dist/lenis.css";
import "./globals.css";

const casOlgans = localFont({
  src: "../fonts/CasOlgans-Regular.otf",
  variable: "--font-serif",
  display: "swap",
  weight: "400",
  style: "normal",
});

const sans = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Kesari by Bhumika Patel",
  description:
    "Same traditions. New stories. Resham, zardozi, ari, cutdana, pitta tiki — craft in every detail.",
};

/** Browser chrome matches the parchment wash (not black). Favicon: app/icon.png */
export const viewport = {
  themeColor: "#b8a686",
  colorScheme: "light" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${casOlgans.variable} ${sans.variable} ${script.variable} h-full antialiased`}
    >
      <body
        className={`${casOlgans.className} min-h-full flex flex-col text-ink`}
      >
        <BagWishlistProvider>
          <Suspense fallback={null}>
            <SiteTheme />
          </Suspense>
          <SmoothScroll />
          <IntroSplash />
          {children}
          <StorefrontOnly>
            <Suspense fallback={null}>
              <SiteWhatsApp />
            </Suspense>
          </StorefrontOnly>
        </BagWishlistProvider>
      </body>
    </html>
  );
}
