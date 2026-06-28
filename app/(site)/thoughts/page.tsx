import Link from "next/link";
import { projects } from ".velite";

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

const thoughts = projects
	.filter((project) => project.published)
	.sort(
		(a, b) =>
			Date.parse(b.date ?? "1970-01-01") - Date.parse(a.date ?? "1970-01-01"),
	)
	.map((project) => ({
		title: project.title,
		description: project.description,
		href: project.path,
		date: project.date,
	}));

export default function ThoughtsPage() {
	return (
		<section
			className="route-panel motion-enter motion-delay-1"
			aria-labelledby="sparks-title"
		>
			<header className="panel-head">
				<div>
					<p className="type-kicker">Writing</p>
					<h2 id="sparks-title">Thoughts</h2>
				</div>
			</header>
			<div className="portfolio-list">
				{thoughts.map((item) => (
					<Link
						key={item.href + item.title}
						href={item.href}
						className="portfolio-row project-row group"
					>
						<div>
							<h3>{item.title}</h3>
							<p>{item.description}</p>
						</div>
						<span className="small-meta">{formatThoughtDate(item.date)}</span>
					</Link>
				))}
			</div>
		</section>
	);
}
