import Link from "next/link";

const elsewhere = [
	{
		title: "nix-config",
		description:
			"Personal NixOS and Home Manager configuration for moving cleanly between machines.",
		href: "https://github.com/zhongjis/nix-config",
		meta: "GitHub",
	},
];

export default function ElsewherePage() {
	return (
		<section
			className="route-panel motion-enter motion-delay-1"
			aria-labelledby="misc-title"
		>
			<header className="panel-head">
				<div>
					<p className="type-kicker">Project highlights</p>
					<h2 id="misc-title">Elsewhere</h2>
				</div>
			</header>
			<div className="portfolio-list">
				{elsewhere.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className="portfolio-row project-row group"
						target="_blank"
						rel="noopener noreferrer"
					>
						<div className="row-copy">
							<h3>{item.title}</h3>
							<p>{item.description}</p>
						</div>
						<span className="small-meta row-meta">{item.meta}</span>
					</Link>
				))}
			</div>
		</section>
	);
}
