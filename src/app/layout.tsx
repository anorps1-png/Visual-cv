import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Modernist est "set entirely in Archivo". next/font l'auto-héberge (aucun
// appel réseau vers Google) et expose --font-archivo, consommé par modernist.css.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Visual CV Cameroon",
  description: "Générez un CV optimisé ATS et une lettre de motivation en un clic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
