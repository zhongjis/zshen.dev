import "../global.css";
import { Inter } from "next/font/google";
import LocalFont from "next/font/local";
import type { Metadata } from "next";
import { Analytics } from "./components/analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://zshen.dev"),
  title: {
    default: "zshen.dev",
    template: "%s | zshen.dev",
  },
  description:
    "Technical, refined, human - product-minded engineering shaped by clarity, craft, and shipped work.",
  openGraph: {
    title: "zshen.dev",
    description:
      "Technical, refined, human - product-minded engineering shaped by clarity, craft, and shipped work.",
    url: "https://zshen.dev",
    siteName: "zshen.dev",
    images: [
      {
        url: "https://zshen.dev/og.png",
        width: 1920,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "zshen.dev",
    card: "summary_large_image",
    description:
      "Technical, refined, human - product-minded engineering shaped by clarity, craft, and shipped work.",
  },
  icons: {
    shortcut: "/favicon.png",
  },
};
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const calSans = LocalFont({
  src: "../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={[inter.variable, calSans.variable].join(" ")}>
      <head>
      </head>
      <body
        className={`text-zinc-100 antialiased ${
          process.env.NODE_ENV === "development" ? "debug-screens" : undefined
        }`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-zinc-100 focus:px-3 focus:py-2 focus:text-zinc-900"
        >
          Skip to main content
        </a>
        <main id="main-content" className="relative">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
