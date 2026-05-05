import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { HashRouteNormalizer } from "./hash-route-normalizer";
import { NavLink } from "./nav-link";

const navigation = [
	{ name: "About me", href: "/" },
	{ name: "Consulting", href: "/consulting" },
	{ name: "Thoughts", href: "/thoughts" },
	{ name: "Elsewhere", href: "/elsewhere" },
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

export function PrimaryNav({ className }: { className?: string }) {
	return (
		<nav className={`portfolio-nav ${className ?? ""}`} aria-label="Primary">
			{navigation.map((item) => (
				<NavLink key={item.href} href={item.href}>
					{item.name}
				</NavLink>
			))}
		</nav>
	);
}

export function SiteHeading() {
	return <h1 id="index-title">ZHONGJIE SHEN</h1>;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="portfolio-shell relative isolate overflow-hidden">
			<HashRouteNormalizer />
			<aside
				className="portfolio-rail"
				aria-label="Site identity and navigation"
			>
				<Link href="/" className="mark-row" aria-label="Home">
					<span className="mark" aria-hidden="true">
						<img
							className="panda-mark"
							src="/panda-mark.png"
							alt=""
							draggable={false}
						/>
					</span>
				</Link>

				<PrimaryNav className="portfolio-nav-rail" />
			</aside>

			<div className="portfolio-content relative min-w-0">
				<header className="panel-head site-shell-head">
					<div>
						<SiteHeading />
					</div>
					<PrimaryNav className="portfolio-nav-mobile" />
				</header>
				{children}
			</div>

			<footer className="portfolio-footer">
				<span>
					© 2026 Zhongjie Shen · Inspired by:{" "}
					<Link
						href="https://mitchellh.com/"
						className="footer-credit-link"
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
						rel={
							link.href.startsWith("http") ? "noopener noreferrer" : undefined
						}
					>
						{link.icon}
					</Link>
				))}
			</footer>
		</div>
	);
}
