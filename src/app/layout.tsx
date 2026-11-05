import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://dr4checker.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DR4 Checker: Ahrefs Domain Rating DR3 vs DR4",
    template: "%s | DR4 Checker",
  },
  description:
    "Check how a domain's Ahrefs Domain Rating changes under DR4 before the Dec 1, 2026 rollout. Compare current DR with the new model for up to five domains.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "DR4 Checker: Ahrefs Domain Rating DR3 vs DR4",
    description:
      "Preview Ahrefs DR4 scores next to current Domain Rating before December 1, 2026.",
    siteName: "DR4 Checker",
  },
  twitter: {
    card: "summary_large_image",
    title: "DR4 Checker: Ahrefs Domain Rating DR3 vs DR4",
    description:
      "Preview Ahrefs DR4 scores next to current Domain Rating before December 1, 2026.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
