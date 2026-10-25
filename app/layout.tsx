import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { siteDescription, siteName } from "@/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteName} — Discover Nature. Design Your Style.`,
    template: "%s · Animoda",
  },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    title: `${siteName} — Discover Nature. Design Your Style.`,
    description: siteDescription,
    siteName,
    locale: "en",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {/* The approved Stitch screens use Material Symbols. next/font does not ship this icon font. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {children}
      </body>
    </html>
  );
}
