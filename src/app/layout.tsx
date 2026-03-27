import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Louvi — Collectez et affichez vos témoignages clients",
  description:
    "Louvi est l'outil SaaS pour collecter, gérer et afficher les témoignages de vos clients satisfaits. Boostez votre crédibilité avec un Wall of Love.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
