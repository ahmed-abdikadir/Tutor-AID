import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: {
    default: "Kiin Clothline | Bespoke Suits in Eastleigh, Nairobi",
    template: "%s | Kiin Clothline"
  },
  description: "Kiin Clothline: bespoke, made-to-measure suits tailored in Eastleigh, Nairobi. Expert tailoring for weddings, business, and special occasions. Book your fitting online.",
  keywords: ["bespoke suits", "made to measure suits", "custom suits", "tailoring", "Eastleigh Nairobi", "Nairobi tailor", "wedding suits", "business suits", "formal wear", "Kenyan suits", "African tailoring"],
  authors: [{ name: "Kiin Clothline" }],
  creator: "Kiin Clothline",
  publisher: "Kiin Clothline",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://kiinclothline.com"),
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://kiinclothline.com",
    siteName: "Kiin Clothline",
    title: "Kiin Clothline | Bespoke Suits in Eastleigh, Nairobi",
    description: "Kiin Clothline: bespoke, made-to-measure suits tailored in Eastleigh, Nairobi. Expert tailoring for weddings, business, and special occasions.",
    images: [
      {
        url: "/suits/navy-pinstripe-double-breasted.jpg",
        width: 1200,
        height: 630,
        alt: "Kiin Clothline bespoke suit tailoring"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiin Clothline | Bespoke Suits in Eastleigh, Nairobi",
    description: "Kiin Clothline: bespoke, made-to-measure suits tailored in Eastleigh, Nairobi. Expert tailoring for weddings, business, and special occasions.",
    images: ["/suits/navy-pinstripe-double-breasted.jpg"],
    creator: "@kiin_clothline"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "google-site-verification-code",
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
