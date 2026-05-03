import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const navigation = [
	{ name: "Index", href: "#index" },
	{ name: "Consulting", href: "#consulting" },
	{ name: "Sparks", href: "#sparks" },
	{ name: "Misc", href: "#misc" },
];

const consulting = [
	{
		title: "AI tooling",
		href: "/services",
	},
	{
		title: "Software Contracting",
		href: "/services",
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
		href: "/services",
	},
];

const keywordNotes = [
	{
		label: "AI",
		text: "Tooling that helps humans keep context, move faster, and still inspect the work.",
	},
	{
		label: "Enterprise",
		text: "Practical software for teams that need clarity, contracts, and maintainable operations.",
	},
	{
		label: "Nix",
		text: "Rebuildable environments and machines, with less mystery state between places.",
	},
	{
		label: "Crafts",
		text: "Small, meticulous improvements in type, color, workflow, and everyday reliability.",
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

export default function Home() {
	return (
		<div className="portfolio-shell relative isolate overflow-hidden">
			<aside className="portfolio-rail motion-enter" aria-label="Site identity and navigation">
				<Link href="/" className="mark-row" aria-label="Home">
					<span className="mark" aria-hidden="true">
						<svg className="panda-mark" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
							<rect x="2" y="1" width="3" height="4" fill="var(--bg)" />
							<rect x="11" y="1" width="3" height="4" fill="var(--bg)" />
							<rect x="4" y="2" width="8" height="1" fill="var(--fg)" />
							<rect x="3" y="3" width="10" height="2" fill="var(--fg)" />
							<rect x="2" y="5" width="12" height="6" fill="var(--fg)" />
							<rect x="3" y="11" width="10" height="2" fill="var(--fg)" />
							<rect x="4" y="13" width="8" height="1" fill="var(--fg)" />
							<rect x="4" y="6" width="3" height="3" fill="var(--bg)" />
							<rect x="9" y="6" width="3" height="3" fill="var(--bg)" />
							<rect x="5" y="7" width="1" height="1" fill="var(--fg)" />
							<rect x="10" y="7" width="1" height="1" fill="var(--fg)" />
							<rect x="3" y="9" width="1" height="1" fill="var(--seal)" />
							<rect x="12" y="9" width="1" height="1" fill="var(--seal)" />
							<rect x="7" y="9" width="2" height="1" fill="var(--bg)" />
							<rect x="6" y="10" width="1" height="1" fill="var(--bg)" />
							<rect x="9" y="10" width="1" height="1" fill="var(--bg)" />
						</svg>
					</span>
				</Link>

				<nav className="portfolio-nav" aria-label="Primary">
					{navigation.map((item) => (
						<a key={item.href} href={item.href} className="side-link">
							{item.name}
						</a>
					))}
				</nav>
			</aside>

			<div className="portfolio-content relative min-w-0">
				<section
					id="index"
					className="portfolio-panel motion-enter motion-delay-1"
					aria-labelledby="index-title"
				>
					<header className="panel-head">
						<div>
							<h1 id="index-title">Zhongjie Shen</h1>
						</div>
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
									I build AI tooling that keeps humans in the loop, enterprise
									software that stays understandable, Nix systems that move cleanly
									between machines, and craft-minded interfaces that keep the surface
									quiet.
								</p>
								<p>
									The surface stays calm. Under it: rebuildable machines,
									deliberate interfaces, and tools shaped until they feel reliable
									enough to disappear.
								</p>
							</div>
							<div className="keyword-notes" aria-label="Supporting keywords">
								{keywordNotes.map((note) => (
									<p key={note.label} className="keyword-note">
										<strong>{note.label}</strong>
										<span>{note.text}</span>
									</p>
								))}
							</div>
						</div>

						<div className="weather-field" aria-label="Animated calm current becoming storm">
							<div className="hero-current" aria-hidden="true">
								<span className="current-thread current-thread-a" />
								<span className="current-thread current-thread-b" />
								<span className="current-thread current-thread-c" />
							</div>
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
					</header>
					<div className="misc-links">
						<Link
							href="https://github.com/zhongjis/nix-config"
							target="_blank"
							rel="noopener noreferrer"
						>
							https://github.com/zhongjis/nix-config
						</Link>
					</div>
				</section>
			</div>

			<footer className="portfolio-footer">
				<span>© 2026 Zhongjie Shen</span>
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
