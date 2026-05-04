/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./mdx-components.tsx",
		"content/**/*.mdx",
	],

	theme: {
		extend: {
			colors: {
				bg: "var(--bg)",
				surface: "var(--surface)",
				fg: "var(--fg)",
				muted: "var(--muted)",
				border: "var(--border)",
				accent: "var(--accent)",
			},
			typography: {
				DEFAULT: {
					css: {
						color: "var(--fg)",
						"--tw-prose-body": "var(--fg)",
						"--tw-prose-headings": "var(--fg)",
						"--tw-prose-lead": "var(--muted)",
						"--tw-prose-links": "var(--accent)",
						"--tw-prose-bold": "var(--fg)",
						"--tw-prose-counters": "var(--muted)",
						"--tw-prose-bullets": "var(--accent)",
						"--tw-prose-hr": "var(--border)",
						"--tw-prose-quotes": "var(--fg)",
						"--tw-prose-quote-borders": "var(--accent)",
						"--tw-prose-captions": "var(--muted)",
						"--tw-prose-code": "var(--fg)",
						"--tw-prose-pre-code": "var(--fg)",
						"--tw-prose-pre-bg": "var(--surface)",
						"--tw-prose-th-borders": "var(--border)",
						"--tw-prose-td-borders": "var(--border)",
						"code::before": {
							content: '""',
						},
						"code::after": {
							content: '""',
						},
					},
				},
				quoteless: {
					css: {
						"blockquote p:first-of-type::before": { content: "none" },
						"blockquote p:first-of-type::after": { content: "none" },
					},
				},
			},
			fontFamily: {
				sans: [
					"'Söhne'",
					"-apple-system",
					"BlinkMacSystemFont",
					"system-ui",
					"sans-serif",
				],
				display: [
					"'Tiempos Headline'",
					"'Newsreader'",
					"'Iowan Old Style'",
					"Georgia",
					"serif",
				],
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("tailwindcss-debug-screens"),
	],
};
