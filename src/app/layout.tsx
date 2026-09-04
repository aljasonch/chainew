import type { Metadata, Viewport } from "next";
import { Montserrat, Source_Serif_4 } from "next/font/google";
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
const siteUrl = baseUrl;
const ogImage = `/api/og?title=${encodeURIComponent(siteName)}&subtitle=${encodeURIComponent(
  "AI, finance, blockchain, and policy news",
)}`;
const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  alternateName: "Chainew News",
  url: siteUrl,
};

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
};

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: siteName,
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    title: siteName,
  },
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141412" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${sourceSerif.variable}`}>
      <body className="antialiased font-sans" style={{ background: 'var(--color-bg-primary)' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
        <Suspense fallback={null}>
          <RouteLoadingIndicator />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
