import Link from "next/link";
import ParticleOrbCSS from "../components/particle-orb";
import { ContactTrigger } from "./_components/contact-trigger";
import { projects } from ".velite";

const consulting = [
	{
		title: "AI tooling",
		description:
			"Shape agent workflows, eval loops, and internal tools that make AI work reliable.",
		meta: "Contact",
		action: "Highlight contact links",
	},
	{
		title: "Software Contracting",
		description:
			"Build focused product surfaces and backend systems for complex enterprise work.",
		meta: "Contact",
		action: "Highlight contact links",
	},
	{
		title: "Home Lab",
		description:
			"Design rebuildable infrastructure on K3s and Nix, from machines to day-two operations.",
		meta: "Contact",
		action: "Highlight contact links",
	},
];

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
	}));

const elsewhere = [
	{
		title: "nix-config",
		description:
			"Personal NixOS and Home Manager configuration for moving cleanly between machines.",
		href: "https://github.com/zhongjis/nix-config",
		meta: "GitHub",
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
									href="/thoughts/home-kubernetes-cluster"
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

					<figure className="weather-field" aria-label="Particle Orb CSS">
						<ParticleOrbCSS />
					</figure>
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
						<h2 id="consulting-title">Need a helping hand?</h2>
					</div>
				</header>
				<div className="portfolio-list consulting-list">
					{consulting.map((item, index) => (
						<ContactTrigger
							key={item.title}
							index={twoDigit(index)}
							title={item.title}
							description={item.description}
							meta={item.meta}
							action={item.action}
						/>
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
						<p className="type-kicker">Writing</p>
						<h2 id="sparks-title">Thoughts</h2>
					</div>
				</header>
				<div className="portfolio-list">
					{thoughts.map((item, index) => (
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
		</>
	);
}
