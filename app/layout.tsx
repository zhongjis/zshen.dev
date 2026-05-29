import "../global.css";
import { Analytics } from "@vercel/analytics/next";
import { Agentation } from "agentation";
import type { Metadata } from "next";

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

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body
				className={`bg-bg text-fg antialiased ${
					process.env.NODE_ENV === "development" ? "debug-screens" : ""
				}`}
			>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-fg focus:ring-2 focus:ring-accent"
				>
					Skip to main content
				</a>
				<main id="main-content" className="relative">
					{children}
				</main>
				{process.env.NODE_ENV === "development" && <Agentation />}
				<Analytics />
			</body>
		</html>
	);
}
