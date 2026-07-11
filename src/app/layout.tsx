import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ThemeVariables } from "@/components/theme/theme-variables";
import { getStoreBranding } from "@/lib/settings";
import "./globals.css";

const bodyFont = Outfit({
  variable: "--font-body-family",
  subsets: ["latin"],
});

const displayFont = Playfair_Display({
  variable: "--font-display-family",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();

  return {
    title: {
      default: branding.fullTitle,
      template: "%s | " + branding.fullTitle,
    },
    description:
      "Spille rotonde personalizzate per zaini. Crea la tua spilla con foto o disegno e ordina online.",
    openGraph: {
      siteName: branding.fullTitle,
      locale: "it_IT",
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={bodyFont.variable + " " + displayFont.variable}>
      <body className="min-h-screen antialiased">
        <ThemeVariables />
        {children}
        <CookieBanner />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
