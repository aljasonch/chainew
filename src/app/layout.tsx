import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NewsPortal - Your Trusted News Source",
    template: "%s | NewsPortal",
  },
  description:
    "Stay informed with the latest news on technology, business, politics, sports, and more.",
  keywords: ["news", "technology", "business", "politics", "sports"],
  authors: [{ name: "NewsPortal" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NewsPortal",
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
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
