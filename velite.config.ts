import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { defineCollection, defineConfig, s } from "velite";

const projects = defineCollection({
	name: "Project",
	pattern: "projects/**/*.mdx",
	schema: s
		.object({
			title: s.string(),
			description: s.string().nullable().default("A practical build by zshen."),
			date: s.isodate().optional(),
			published: s.boolean().default(false),
			url: s.string().optional(),
			repository: s.string().optional(),
			body: s.mdx(),
			slug: s.path(),
		})
		.transform((data) => ({
			...data,
			description: data.description?.trim() || "A practical build by zshen.",
			// Match Contentlayer's computed slug: strip the first path segment (e.g. "projects/foo" -> "foo")
			slug: data.slug.split("/").slice(1).join("/"),
			// Public content URLs live under /thoughts/{slug}.
			path: `/thoughts/${data.slug.split("/").slice(1).join("/")}`,
		})),
});

export default defineConfig({
	root: "content",
	output: {
		data: ".velite",
		assets: "public/static",
		base: "/static/",
		name: "[name]-[hash:6].[ext]",
		clean: false,
	},
	collections: { projects },
	mdx: {
		remarkPlugins: [remarkGfm],
		rehypePlugins: [
			rehypeSlug,
			[rehypePrettyCode, { theme: "github-dark" }],
			rehypeAutolinkHeadings,
		],
	},
});
