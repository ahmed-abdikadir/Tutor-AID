import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Kiin Clothline | Bespoke Suits in Eastleigh, Nairobi",
  description: "Kiin Clothline: bespoke, made-to-measure suits tailored in Eastleigh, Nairobi. View our suits and book your fitting online.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
