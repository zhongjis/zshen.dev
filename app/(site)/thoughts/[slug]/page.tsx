import { Mdx } from "@/app/components/mdx";
import { Redis } from "@upstash/redis";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from ".velite";
import "./mdx.css";
import { ReportView } from "./view";

export const revalidate = 60;

type Params = {
	slug: string;
};

type Props = {
	params: Promise<Params>;
};

function hasRedisEnv() {
	return Boolean(
		process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
	);
}

const redis = hasRedisEnv() ? Redis.fromEnv() : undefined;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});

function formatThoughtDate(date: string | undefined) {
	if (!date) {
		return "Undated";
	}

	const timestamp = Date.parse(date);

	if (Number.isNaN(timestamp)) {
		return "Undated";
	}

	return dateFormatter.format(new Date(timestamp));
}

function getPublishedProject(slug: string) {
	return projects.find(
		(project) =>
			project.slug === slug && project.published && project.body.trim().length > 0,
	);
}

function getPublishedTime(date: string | undefined) {
	if (!date) {
		return undefined;
	}

	const timestamp = Date.parse(date);

	if (Number.isNaN(timestamp)) {
		return undefined;
	}

	return new Date(timestamp).toISOString();
}

async function getThoughtViews(slug: string) {
	if (!redis) {
		return 0;
	}

	try {
		return (
			(await redis.get<number>(["pageviews", "projects", slug].join(":"))) ?? 0
		);
	} catch {
		return 0;
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const project = getPublishedProject(slug);

	if (!project) {
		return {
			title: "Thought not found",
			robots: {
				index: false,
				follow: false,
			},
		};
	}

	const canonicalPath = `/thoughts/${project.slug}`;
	const publishedTime = getPublishedTime(project.date);

	return {
		title: project.title,
		description: project.description,
		alternates: {
			canonical: canonicalPath,
		},
		openGraph: {
			title: project.title,
			description: project.description,
			url: canonicalPath,
			type: "article",
			...(publishedTime ? { publishedTime } : {}),
		},
		twitter: {
			title: project.title,
			description: project.description,
			card: "summary_large_image",
		},
	};
}

export async function generateStaticParams(): Promise<Params[]> {
	return projects
		.filter((p) => p.published)
		.map((p) => ({
			slug: p.slug,
		}));
}

export default async function PostPage(props: Props) {
	const { slug } = await props.params;
	const project = getPublishedProject(slug);

	if (!project) {
		notFound();
	}

	const views = await getThoughtViews(slug);

	const formattedViews = Intl.NumberFormat("en-US", {
		notation: "compact",
	}).format(views);
	const repositoryUrl = project.repository
		? `https://github.com/${project.repository}`
		: undefined;

	return (
		<section
			className="route-panel motion-enter motion-delay-1"
			aria-labelledby="thought-title"
		>
			<header className="mb-12 grid gap-5">
				<Link href="/thoughts" className="small-meta text-link w-fit">
					← Back to thoughts
				</Link>

				<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
					<span className="small-meta">{formatThoughtDate(project.date)}</span>
					<span className="small-meta" aria-hidden="true">
						·
					</span>
					<span
						title="View counter for this page"
						className="small-meta num-tabular"
					>
						{formattedViews} views
					</span>
				</div>

				<div className="grid gap-3">
					<h1 id="thought-title" className="type-display-md measure">
						{project.title}
					</h1>
					<p className="type-body measure text-muted">{project.description}</p>
				</div>

				{(repositoryUrl || project.url) && (
					<div className="flex flex-wrap gap-2 pt-1">
						{repositoryUrl && (
							<a
								href={repositoryUrl}
								className="ui-btn ui-btn-quiet no-underline"
								target="_blank"
								rel="noreferrer"
							>
								Repository
							</a>
						)}
						{project.url && (
							<a
								href={project.url}
								className="ui-btn ui-btn-quiet no-underline"
								target="_blank"
								rel="noreferrer"
							>
								Site
							</a>
						)}
					</div>
				)}
			</header>
			<ReportView slug={project.slug} />

			<article className="motion-enter motion-delay-2 prose prose-quoteless measure">
				<Mdx code={project.body} />
			</article>
		</section>
	);
}
