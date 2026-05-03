"use client";
import { Github, Mail } from "lucide-react";
import Link from "next/link";
import { Card } from "../components/card";
import { Navigation } from "../components/nav";

const socials = [
	{
		icon: <Mail size={20} />,
		href: "mailto:zhongjie.x.shen@gmail.com",
		label: "Email",
		handle: "zhongjie.x.shen@gmail.com",
	},
	{
		icon: <Github size={20} />,
		href: "https://github.com/zhongjis",
		label: "GitHub",
		handle: "zhongjis",
	},
];

export default function ContactPage() {
	return (
		<div className="relative min-h-screen pb-20">
			<Navigation />
			<div className="container mx-auto px-6 pt-28 sm:pt-32 lg:px-10">
				<div className="mb-16 max-w-3xl motion-enter">
					<p className="type-kicker motion-fade motion-delay-1 text-accent">
						Contact
					</p>
					<h1 className="type-display-lg motion-enter motion-delay-2 mt-4 font-display text-fg">
						Open channel, low noise.
					</h1>
					<p className="type-lead measure motion-enter motion-delay-3 mt-6 text-muted">
						Reach out with an idea, collaboration, or problem worth solving. I
						prefer direct messages and clear intent.
					</p>
				</div>

				<div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10">
					{socials.map((s, index) => {
						const opensNewTab = !s.href.startsWith("mailto:");
						const animationDelay = `${360 + index * 90}ms`;

						return (
							<Card key={s.href}>
								<Link
									href={s.href}
									target={opensNewTab ? "_blank" : undefined}
									rel={opensNewTab ? "noopener noreferrer" : undefined}
									aria-label={
										opensNewTab
											? `${s.label} (${s.handle}) opens in a new tab`
											: `${s.label} (${s.handle})`
									}
									className="group motion-enter relative flex min-h-[18rem] flex-col items-start justify-between gap-8 p-6 transition-transform duration-300 [transition-timing-function:var(--ease-out-quart)] hover:-translate-y-1 active:scale-[0.98] focus-visible:rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:min-h-[20rem] sm:p-8"
									style={{ animationDelay }}
								>
									<span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg text-fg transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] group-hover:scale-105 group-hover:border-accent group-hover:text-accent motion-reduce:transform-none">
										{s.icon}
									</span>

									<div className="z-10 flex w-full min-w-0 flex-col">
										<span className="font-display text-[clamp(1.25rem,2.2vw,1.85rem)] leading-[1.14] tracking-[-0.01em] text-fg transition-colors group-hover:text-accent [overflow-wrap:anywhere]">
											{s.handle}
										</span>
										<span className="type-label mt-3 text-muted transition-colors group-hover:text-fg">
											{s.label}
										</span>
									</div>

									<span className="type-label text-muted transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] group-hover:translate-x-1 group-hover:text-accent">
										Open link {"->"}
									</span>
								</Link>
							</Card>
						);
					})}
				</div>
			</div>
		</div>
	);
}
