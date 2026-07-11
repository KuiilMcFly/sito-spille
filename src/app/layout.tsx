import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import "./globals.css";

const bodyFont = Outfit({
  variable: "--font-body-family",
  subsets: ["latin"],
});

const displayFont = Playfair_Display({
  variable: "--font-display-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Valeria Senpai Spille Custom",
    template: "%s | Valeria Senpai Spille Custom",
  },
  description:
    "Spille rotonde personalizzate per zaini. Crea la tua spilla con foto o disegno e ordina online.",
  openGraph: {
    siteName: "Valeria Senpai Spille Custom",
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={bodyFont.variable + " " + displayFont.variable}>
      <body className="min-h-screen antialiased">
        {children}
        <CookieBanner />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
