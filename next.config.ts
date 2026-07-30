import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export statique : aucun code serveur applicatif (AD-4).
  // La commande "next export" est dépréciée depuis Next.js 13+ ; ce flag suffit.
  output: "export",
};

export default nextConfig;
