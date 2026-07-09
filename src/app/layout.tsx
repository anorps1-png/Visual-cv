import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
