import { Eye } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import type { Project } from ".velite";

type Props = {
	project: Project;
	views: number;
};

export const Article: FC<Props> = ({ project, views }) => {
	return (
		<Link
			href={`/projects/${project.slug}`}
			className="group block focus-visible:rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
		>
			<article className="p-6 transition-transform duration-300 [transition-timing-function:var(--ease-out-quart)] motion-reduce:transform-none md:p-8">
				<div className="flex items-center justify-between gap-2">
					<span className="type-label num-tabular text-muted transition-colors group-hover:text-fg">
						{project.date ? (
							<time dateTime={new Date(project.date).toISOString()}>
								{Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
									new Date(project.date),
								)}
							</time>
						) : (
							<span>Soon</span>
						)}
					</span>
					<span className="type-label num-tabular flex items-center gap-1 text-muted">
						<Eye className="h-4 w-4" />{" "}
						{Intl.NumberFormat("en-US", { notation: "compact" }).format(views)}
					</span>
				</div>

				<h2 className="type-display-md z-20 mt-4 font-display text-fg transition-colors group-hover:text-accent">
					{project.title}
				</h2>
				<p className="type-body-sm z-20 mt-4 text-muted transition-colors group-hover:text-fg">
					{project.description}
				</p>

				<span className="type-label mt-8 inline-block text-accent transition-transform duration-300 [transition-timing-function:var(--ease-out-quart)] group-hover:translate-x-1 motion-reduce:transform-none">
					Read more {"->"}
				</span>
			</article>
		</Link>
	);
};
