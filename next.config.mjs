import { build } from "velite";

/** @type {import('next').NextConfig} */
const nextConfig = {
	turbopack: {},
	webpack: (config) => {
		config.plugins.push(
			new (class {
				apply(compiler) {
					compiler.hooks.beforeCompile.tapPromise("velite", async () => {
						await build();
					});
				}
			})(),
		);
		return config;
	},
};

export default nextConfig;
