import type { Metadata, Viewport } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JEEVAN AI — Public Health Intelligence Platform",
    template: "%s | JEEVAN AI",
  },
  description:
    "Real-time public-health intelligence and emergency decision-support platform for large-scale gatherings. Powered by explainable AI with human-in-the-loop safety.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" }
    ],
    apple: "/favicon.png",
  },
  keywords: [
    "public health",
    "emergency response",
    "AI",
    "Kumbh",
    "decision support",
    "real-time",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
