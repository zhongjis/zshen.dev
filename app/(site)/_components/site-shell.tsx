import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const navigation = [
	{ name: "About me", href: "#index" },
	{ name: "Consulting", href: "#consulting" },
	{ name: "Sparks", href: "#sparks" },
	{ name: "Misc", href: "#misc" },
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
				<a key={item.href} href={item.href} className="side-link">
					{item.name}
				</a>
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
			<aside
				className="portfolio-rail motion-enter"
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
				<header className="panel-head site-shell-head motion-enter motion-delay-1">
					<div>
						<SiteHeading />
					</div>
					<PrimaryNav className="portfolio-nav-mobile" />
				</header>
				{children}
			</div>

			<footer className="portfolio-footer">
				<span>
					© 2026 Zhongjie Shen · Design inspired by{" "}
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
