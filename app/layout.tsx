import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SerwistProvider } from "@serwist/next/react";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

// Inter remplace Geist Sans pour le corps de texte — police système
// réellement utilisée par brets.fr (DESIGN.md > Typography), prioritaire
// sur la lisibilité en rayon avec une connexion mobile capricieuse.
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Police display du titre "CROUNCH" — auto-hébergée (fichier .otf fourni),
// jamais chargée depuis un CDN tiers.
const tanker = localFont({
  src: "./fonts/tanker-regular.otf",
  variable: "--font-tanker",
  display: "swap",
});

// Police du nom des saveurs (tuiles + popin détail) — DESIGN.md > Typography
// > `tagline` (Recoleta), auto-hébergée en semi-bold (fichier .otf fourni).
const recoleta = localFont({
  src: "./fonts/recoleta-semibold.otf",
  variable: "--font-recoleta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crounch",
  description: "Suivi de dégustation des saveurs Brets",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Crounch",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${geistMono.variable} ${tanker.variable} ${recoleta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SerwistProvider swUrl="/sw.js">{children}</SerwistProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
