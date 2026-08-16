import Link from "next/link";

const elsewhere = [
	{
		title: "nix-config",
		description:
			"Personal NixOS and Home Manager configuration for moving cleanly between machines.",
		href: "https://github.com/zhongjis/nix-config",
		meta: "GitHub",
	},
	{
		title: "server-config",
		description:
			"Homelab infrastructure for three Colmena-managed NixOS k3s nodes and Flux-managed Kubernetes apps.",
		href: "https://github.com/zhongjis/server-config",
		meta: "GitHub",
	},
	{
		title: "pi-config",
		description:
			"Panda Harness: personal Pi agents and extensions, with a reproducible Nix dev shell and root extension testing flow.",
		href: "https://github.com/zhongjis/pi-config",
		meta: "GitHub",
	},
	{
		title: "agent-skills",
		description:
			"Canonical, public-safe agent skills for Nix and non-Nix consumers.",
		href: "https://github.com/zhongjis/agent-skills",
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
