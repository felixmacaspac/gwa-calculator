import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GWA Calculator | National University PH - Calculate Your GWA",
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
    title: "GWA Calculator | NU - Calculate Your Grade Weighted Average",
    description:
      "Easy-to-use GWA Calculator for NU students. Calculate your Grade Weighted Average quickly and accurately.",
    url: "https://gwa-calculator-fm.vercel.app/",
    siteName: "GWA Calculator | NU",
    locale: "en_US",
    type: "website",
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
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
      <body className={poppins.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
