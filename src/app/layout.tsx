import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { RouteLoadingIndicator } from "@/components/RouteLoadingIndicator";
import { getBaseUrl } from "@/lib/utils";

const siteName = "Chainew";
const siteTitle = `${siteName} | Technology, Finance & Policy News`;
const siteDescription =
  "Chainew delivers trusted coverage of tech, blockchain, finance, and public affairs, connecting technology, markets, and policy with clear analysis.";
const siteKeywords = [
  "Chainew",
  "tech news",
  "technology",
  "AI",
  "machine learning",
  "finance",
  "fintech",
  "blockchain",
  "crypto",
  "DeFi",
  "public affairs",
  "tech policy",
  "cybersecurity",
  "software development",
  "emerging technology",
  "news analysis",
];

const baseUrl = getBaseUrl();
const ogImage = `/api/og?title=${encodeURIComponent(siteName)}&subtitle=${encodeURIComponent(
  "AI, finance, blockchain, and policy news",
)}`;
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: siteName,
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: "Chainew" }, { name: "aljasonch" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title: siteTitle,
    description: siteDescription,
    url: baseUrl,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${siteName} social preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="antialiased font-sans" style={{ background: 'var(--color-bg-primary)' }}>
        <Suspense fallback={null}>
          <RouteLoadingIndicator />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
