import { Mdx } from "@/app/components/mdx";
import { Redis } from "@upstash/redis";
import { notFound } from "next/navigation";
import { Header } from "./header";
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

const redis = Redis.fromEnv();

export async function generateStaticParams(): Promise<Params[]> {
	return projects
		.filter((p) => p.published)
		.map((p) => ({
			slug: p.slug,
		}));
}

export default async function PostPage(props: Props) {
	const params = await props.params;
	const slug = params?.slug;
	const project = projects.find(
		(project) =>
			project.slug === slug && project.published && project.body.trim().length > 0,
	);

	if (!project) {
		notFound();
	}

	const views =
		(await redis.get<number>(["pageviews", "projects", slug].join(":"))) ?? 0;

	return (
		<div className="min-h-screen">
			<Header project={project} views={views} />
			<ReportView slug={project.slug} />

			<article className="motion-enter motion-delay-2 prose prose-quoteless mx-auto max-w-3xl px-6 py-12 sm:px-8">
				<Mdx code={project.body} />
			</article>
		</div>
	);
}
