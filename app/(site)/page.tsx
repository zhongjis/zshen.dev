import Link from "next/link";
import ParticleOrbCSS from "../components/particle-orb";

const consulting = [
	{
		title: "AI tooling",
		href: "mailto:zhongjie.x.shen@gmail.com",
	},
	{
		title: "Software Contracting",
		href: "mailto:zhongjie.x.shen@gmail.com",
	},
	{
		title: "Home Lab",
		href: "#consulting",
		meta: "Contact",
		action: "Highlight contact links",
	},
];

const sparks = [
	{
		title: "Kubernetes at home",
		description: "Rebuildable machines. Quiet operations. No mystery state.",
		href: "/projects/home-kubernetes-cluster",
	},
	{
		title: "nix-config",
		description:
			"A personal operating system for moving between machines cleanly.",
		href: "/projects/nix-config",
	},
	{
		title: "AI tooling",
		description: "My awesome pi-harness",
		href: "#consulting",
	},
];

function twoDigit(index: number) {
	return String(index + 1).padStart(2, "0");
}

export default function Home() {
	return (
		<>
			<section
				id="index"
				className="portfolio-panel motion-enter motion-delay-1"
				aria-labelledby="index-title"
			>
				<div className="hero-grid">
					<div className="intro">
						<p className="thesis">
							Minimal by default.
							<br />
							Wild on purpose.
						</p>
						<div className="intro-copy">
							<p>
								I'm a developer in San Jose, currently working at{" "}
								<Link
									href="https://business.adobe.com/"
									className="text-link"
									target="_blank"
									rel="noopener noreferrer"
								>
									Adobe for Business
								</Link>
								.
							</p>
							<p>
								By day, I help enterprise teams build custom software for
								complex, high-stakes work.
							</p>
							<p>
								By night, I build AI tools and maintain a home lab on{" "}
								<Link
									href="/projects/home-kubernetes-cluster"
									className="text-link"
								>
									K3s and Nix
								</Link>
								: small systems that keep me curious.
							</p>
							<p>
								My belief: the surface should stay calm. Under it: rebuildable
								machines, deliberate interfaces, and tools shaped until they
								feel reliable enough to disappear.
							</p>
						</div>
					</div>

					<div className="weather-field" aria-label="Particle Orb CSS">
						<ParticleOrbCSS />
					</div>
				</div>
			</section>

			<section
				id="consulting"
				className="portfolio-panel motion-enter motion-delay-1"
				aria-labelledby="consulting-title"
			>
				<header className="panel-head">
					<div>
						<p className="type-kicker">Consulting</p>
						<h2 id="consulting-title">Consulting</h2>
					</div>
					<p className="small-meta">01 / 03</p>
				</header>
				<div className="portfolio-list consulting-list">
					{consulting.map((item, index) => (
						<Link
							key={item.title}
							href={item.href}
							className="portfolio-row consulting-row group"
						>
							<span className="num">{twoDigit(index)}</span>
							<h3>{item.title}</h3>
						</Link>
					))}
				</div>
			</section>

			<section
				id="sparks"
				className="portfolio-panel motion-enter motion-delay-1"
				aria-labelledby="sparks-title"
			>
				<header className="panel-head">
					<div>
						<p className="type-kicker">Sparks</p>
						<h2 id="sparks-title">Sparks</h2>
					</div>
					<p className="small-meta">Blogs</p>
				</header>
				<div className="portfolio-list">
					{sparks.map((item, index) => (
						<Link
							key={item.href + item.title}
							href={item.href}
							className="portfolio-row project-row group"
						>
							<div>
								<h3>{item.title}</h3>
								<p>{item.description}</p>
							</div>
							<span className="small-meta">{twoDigit(index)}</span>
						</Link>
					))}
				</div>
			</section>

			<section
				id="misc"
				className="portfolio-panel motion-enter motion-delay-1"
				aria-labelledby="misc-title"
			>
				<header className="panel-head">
					<div>
						<p className="type-kicker">Misc</p>
						<h2 id="misc-title">Misc</h2>
					</div>
				</header>
				<ul className="misc-links">
					<li>
						<Link
							href="https://github.com/zhongjis/nix-config"
							className="text-link"
							target="_blank"
							rel="noopener noreferrer"
						>
							https://github.com/zhongjis/nix-config
						</Link>
					</li>
				</ul>
			</section>
		</>
	);
}
