import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Crounch",
  description: "Suivi de dégustation des saveurs Brets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
