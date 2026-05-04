import ParticleOrbCSS from "./components/particle-orb";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const navigation = [
	{ name: "About me", href: "#index" },
	{ name: "Consulting", href: "#consulting" },
	{ name: "Sparks", href: "#sparks" },
	{ name: "Misc", href: "#misc" },
];

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
		href: "/projects/home-kubernetes-cluster",
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


const footerLinks = [
	{
		name: "Email",
		href: "mailto:zhongjie.x.shen@gmail.com",
		icon: <Mail className="h-4 w-4" aria-hidden="true" />,
	},
	{
		name: "LinkedIn",
		href: "https://www.linkedin.com/in/zhongjis/",
		icon: <Linkedin className="h-4 w-4" aria-hidden="true" />,
	},
	{
		name: "GitHub",
		href: "https://github.com/zhongjis",
		icon: <Github className="h-4 w-4" aria-hidden="true" />,
	},
];

function twoDigit(index: number) {
	return String(index + 1).padStart(2, "0");
}

function PrimaryNav({ className }: { className?: string }) {
	return (
		<nav className={`portfolio-nav ${className ?? ""}`} aria-label="Primary">
			{navigation.map((item) => (
				<a key={item.href} href={item.href} className="side-link">
					{item.name}
				</a>
			))}
		</nav>
	);
}

export default function Home() {
	return (
		<div className="portfolio-shell relative isolate overflow-hidden">
			<aside className="portfolio-rail motion-enter" aria-label="Site identity and navigation">
				<Link href="/" className="mark-row" aria-label="Home">
					<span className="mark" aria-hidden="true">
						<img className="panda-mark" src="/panda-mark.png" alt="" draggable={false} />
					</span>
				</Link>

				<PrimaryNav className="portfolio-nav-rail" />
			</aside>

			<div className="portfolio-content relative min-w-0">
				<section
					id="index"
					className="portfolio-panel motion-enter motion-delay-1"
					aria-labelledby="index-title"
				>
					<header className="panel-head">
						<div>
							<h1 id="index-title">ZHONGJIE SHEN</h1>
						</div>
							<PrimaryNav className="portfolio-nav-mobile" />
					</header>

					<div className="hero-grid">
						<div className="intro">
							<p className="thesis">
								Minimal by default.
								<br />
								Wild on purpose.
							</p>
							<div className="intro-copy">
								<p>
									I'm a developer in San Jose, currently working at {" "}
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
									By day, I help enterprise teams build custom software for complex,
									high-stakes work.
								</p>
								<p>
									By night, I build AI tools and maintain a home lab on {" "}
									<Link href="/projects/home-kubernetes-cluster" className="text-link">
										K3s and Nix
									</Link>
									: small systems that keep me curious.
								</p>
								<p>
									My belief: the surface should stay calm. Under it: rebuildable
									machines, deliberate interfaces, and tools shaped until they feel
									reliable enough to disappear.
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
						<PrimaryNav className="portfolio-nav-mobile" />
					</header>
					<div className="portfolio-list consulting-list">
						{consulting.map((item, index) => (
							<Link key={item.title} href={item.href} className="portfolio-row consulting-row group">
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
						<PrimaryNav className="portfolio-nav-mobile" />
					</header>
					<div className="portfolio-list">
						{sparks.map((item, index) => (
							<Link key={item.href + item.title} href={item.href} className="portfolio-row project-row group">
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
						<p className="small-meta">01</p>
						<PrimaryNav className="portfolio-nav-mobile" />
					</header>
					<div className="misc-links">
					<Link
						href="https://github.com/zhongjis/nix-config"
						className="text-link"
						target="_blank"
						rel="noopener noreferrer"
					>
						https://github.com/zhongjis/nix-config
					</Link>
					</div>
				</section>
			</div>

			<footer className="portfolio-footer">
				<span>
					© 2026 Zhongjie Shen · Design inspired by {" "}
					<Link
						href="https://mitchellh.com/"
						className="text-link"
						target="_blank"
						rel="noopener noreferrer"
					>
						Mitchell Hashimoto
					</Link>
					.
				</span>
				{footerLinks.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className="contact-link"
						aria-label={link.name}
						target={link.href.startsWith("http") ? "_blank" : undefined}
						rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
					>
						{link.icon}
					</Link>
				))}
			</footer>
		</div>
	);
}
