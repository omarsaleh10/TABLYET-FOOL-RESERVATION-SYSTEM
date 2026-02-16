import type { Metadata } from "next";
import { Cairo, Merriweather, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Tablyet Fool",
  description: "Ramadan Reservation System",
};

import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cairo.variable} ${merriweather.variable} ${inter.variable} antialiased font-sans bg-brand-beige text-brand-charcoal`}
        suppressHydrationWarning={true}
      >
        <main className="min-h-screen">
          {children}
          <Analytics />
        </main>
      </body>
    </html>
  );
}
