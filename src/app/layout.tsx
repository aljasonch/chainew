import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RouteLoadingIndicator } from "@/components/RouteLoadingIndicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Chainew - Your Trusted News Source",
    template: "%s | Chainew",
  },
  description:
    "Stay informed with the latest news on AI, software development, cybersecurity, and emerging technologies.",
  keywords: ["news", "technology", "AI", "software", "cybersecurity", "chainew"],
  authors: [{ name: "Chainew" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Chainew",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} style={{ background: 'var(--color-bg-primary)' }}>
        <RouteLoadingIndicator />
        {children}
      </body>
    </html>
  );
}
