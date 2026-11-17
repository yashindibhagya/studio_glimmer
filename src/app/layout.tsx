import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Pinyon_Script } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});
const pinyon = Pinyon_Script({ variable: "--font-pinyon", subsets: ["latin"], weight: "400" });
const jost = Jost({ variable: "--font-jost", subsets: ["latin"], weight: ["300", "400", "500"] });

// Set NEXT_PUBLIC_SITE_URL once you have your own domain; until then Vercel's production address is used.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Studio Glimmer — Custom Rhinestone Creations",
    template: "%s · Studio Glimmer",
  },
  description:
    "Handmade custom rhinestone creations from Sri Lanka — phone cases, tumblers, apparel, gifts and canvas boards, hand-placed stone by stone since 2020.",
  openGraph: {
    type: "website",
    siteName: "Studio Glimmer",
    images: [{ url: "/logo.png", width: 900, height: 900 }],
  },
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

export const viewport: Viewport = { themeColor: "#efe6d5" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${pinyon.variable} ${jost.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Applies the saved light/dark choice before the page becomes interactive. */}
        <Script src="/theme.js" strategy="beforeInteractive" />
        {/* Counts visitors and page views; see the Analytics tab of the project on Vercel. */}
        <Analytics />
      </body>
    </html>
  );
}
