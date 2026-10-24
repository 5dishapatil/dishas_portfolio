import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Core typography: Cormorant Garamond, Playfair Display, Jost, Caveat */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        {/* Editorial & Display fonts */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Archivo+Black&family=DM+Serif+Display&family=Manrope:wght@500;800&family=Outfit:wght@700&family=Poppins:wght@700&family=Sora:wght@700&family=Space+Grotesk:wght@700&family=Space+Mono&family=Unbounded:wght@600&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#120d08] text-[#f5efe6] selection:bg-[#d8b880]/30 selection:text-[#fff9f0]">
        {children}
      </body>
    </html>
  );
}
