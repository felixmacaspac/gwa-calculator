import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EnyuGWA Calculator | National University PH - Calculate Your GWA",
  description:
    "Easy-to-use GWA Calculator for NU Philippines students. Calculate your Grade Weighted Average quickly and accurately. Free tool for National University PH students.",
  keywords: [
    "GWA Calculator",
    "NU",
    "National University",
    "grade calculation",
    "academic performance",
    "student tools",
  ],
  authors: [{ name: "Felix Macaspac", url: "https://felixmacaspac.dev/" }],
  openGraph: {
    title: "EnyuGWA | NU - Calculate Your Grade Weighted Average",
    description:
      "Easy-to-use GWA Calculator for NU students. Calculate your Grade Weighted Average quickly and accurately.",
    url: "https://gwa-calculator-fm.vercel.app/",
    siteName: "GWA  | NU",
    locale: "en_US",
    type: "website",
  },
  robots: "index, follow",
  metadataBase: new URL("https://gwa-calculator-fm.vercel.app/"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={leagueSpartan.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
