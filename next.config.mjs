// Run Velite build before Next.js starts (works with both Turbopack and webpack)
const isDev = process.argv.includes("dev");
const isBuild = process.argv.includes("build");
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
	process.env.VELITE_STARTED = "1";
	const { build } = await import("velite");
	await build({ watch: isDev, clean: !isDev });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
			{
				source: "/projects/:path*",
				destination: "/thoughts/:path*",
				permanent: true,
			},
		];
	},
};

export default nextConfig;
