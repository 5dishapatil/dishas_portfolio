import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Playfair_Display,
  Jost,
  Caveat,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "DISHA — A Special Direction to Your Life",
  description:
    "A curious mind in a big, beautiful world. Ideas live here — a little bit of code, a little bit of music, a lot of questions, and a lifelong love for beautiful things.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${playfair.variable} ${jost.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Archivo+Black&family=DM+Serif+Display&family=Manrope:wght@500;800&family=Outfit:wght@700&family=Poppins:wght@700&family=Sora:wght@700&family=Space+Grotesk:wght@700&family=Space+Mono&family=Unbounded:wght@600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#120d08] text-[#f5efe6] selection:bg-[#d8b880]/30 selection:text-[#fff9f0]">
        {children}
      </body>
    </html>
  );
}
