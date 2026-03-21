import { Redis } from "@upstash/redis";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Card } from "../components/card";
import { Navigation } from "../components/nav";
import { Article } from "./article";
import { projects } from ".velite";

const redis = Redis.fromEnv();

export const revalidate = 60;

export default async function ProjectsPage() {
	const views = (
		await redis.mget<number[]>(
			...projects.map((p) => ["pageviews", "projects", p.slug].join(":")),
		)
	).reduce(
		(acc, v, i) => {
			acc[projects[i].slug] = v ?? 0;
			return acc;
		},
		{} as Record<string, number>,
	);

	const allPublished = projects
		.filter((p) => p.published)
		.sort(
			(a, b) =>
				new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
				new Date(a.date ?? Number.POSITIVE_INFINITY).getTime(),
		);

	const [featured, ...rest] = allPublished;

	return (
		<div className="relative min-h-screen pb-20">
			<Navigation />

			<div className="container mx-auto px-6 pt-28 sm:pt-32 lg:px-10">
				<div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
					<div className="motion-enter">
						<p className="type-kicker motion-fade motion-delay-1 text-[#d8a55f]">
							Projects
						</p>
						<h1 className="type-display-lg motion-enter motion-delay-2 mt-4 max-w-3xl font-display text-zinc-100">
							Projects, client work, and build notes.
						</h1>
						<p className="type-lead measure motion-enter motion-delay-3 mt-6 text-zinc-300">
							A running archive of client work, personal projects, and posts
							about what I built and learned along the way.
						</p>
					</div>

					<div className="motion-enter motion-delay-4 rounded-3xl border border-[#2d3650] bg-[#212633]/85 p-6 transition-transform duration-500 [transition-timing-function:var(--ease-out-quint)] hover:-translate-y-1">
						<p className="type-label text-zinc-400">Published</p>
						<p className="type-metric mt-3 font-display text-zinc-100">
							{allPublished.length}
						</p>
						<p className="type-body-sm mt-3 text-zinc-400">
							Live entries currently visible in this archive.
						</p>
					</div>
				</div>

				<div className="my-10 h-px bg-gradient-to-r from-transparent via-[#43506d] to-transparent" />

				{featured ? (
					<div className="motion-enter motion-delay-2 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
						<Card>
							<Link
								href={`/projects/${featured.slug}`}
								className="group block focus-visible:rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a55f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191c28]"
							>
								<article className="relative flex h-full min-h-[22rem] flex-col justify-between p-6 sm:p-8">
									<div className="flex items-center justify-between gap-2">
										<div className="type-label num-tabular text-zinc-300">
											{featured.date ? (
												<time dateTime={new Date(featured.date).toISOString()}>
													{Intl.DateTimeFormat(undefined, {
														dateStyle: "medium",
													}).format(new Date(featured.date))}
												</time>
											) : (
												<span>Soon</span>
											)}
										</div>
										<span className="type-label num-tabular flex items-center gap-1 text-zinc-400">
											<Eye className="h-4 w-4" />
											{Intl.NumberFormat("en-US", {
												notation: "compact",
											}).format(views[featured.slug] ?? 0)}
										</span>
									</div>

									<div className="mt-8">
										<h2 className="type-display-md font-display text-zinc-100 transition-colors group-hover:text-white">
											{featured.title}
										</h2>
										<p className="type-body measure mt-5 text-zinc-300 transition-colors group-hover:text-zinc-200">
											{featured.description ||
												"A practical build shaped by product judgment and engineering rigor."}
										</p>
									</div>

									<span className="type-label mt-10 inline-flex items-center text-[#d8a55f] transition-transform duration-300 [transition-timing-function:var(--ease-out-quart)] group-hover:translate-x-1">
										Read more {"->"}
									</span>
								</article>
							</Link>
						</Card>

						<div className="grid gap-8">
							{rest.slice(0, 2).map((project, index) => (
								<div
									key={project.slug}
									className="motion-enter"
									style={{ animationDelay: `${420 + index * 90}ms` }}
								>
									<Card>
										<Article
											project={project}
											views={views[project.slug] ?? 0}
										/>
									</Card>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className="motion-enter" style={{ animationDelay: "240ms" }}>
						<Card>
							<div className="p-8 sm:p-10">
								<p className="type-label text-zinc-400">No entries yet</p>
								<p className="type-display-md mt-4 font-display text-zinc-100">
									Projects are being prepared.
								</p>
							</div>
						</Card>
					</div>
				)}

				{rest.length > 2 ? (
					<div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
						{rest.slice(2).map((project, index) => (
							<div
								key={project.slug}
								className="motion-enter"
								style={{ animationDelay: `${240 + index * 80}ms` }}
							>
								<Card>
									<Article project={project} views={views[project.slug] ?? 0} />
								</Card>
							</div>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
}
