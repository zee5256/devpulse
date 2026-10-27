import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "DevPulse — GitHub analytics, in focus",
    template: "%s · DevPulse",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "GitHub analytics",
    "developer dashboard",
    "contribution heatmap",
    "GitHub score",
    "open source portfolio",
    "Next.js",
  ],
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "DevPulse",
    title: "DevPulse — GitHub analytics, in focus",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPulse — GitHub analytics, in focus",
    description: siteConfig.description,
    creator: "@zee5256",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#070b09" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <Providers>
          <a
            href="#main"
            className="sr-only fixed left-4 top-4 z-[70] rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground focus:not-sr-only"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
