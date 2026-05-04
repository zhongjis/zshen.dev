"use client";
import { ArrowLeft, Eye, Github } from "lucide-react";
import Link from "next/link";
import { type FC, useEffect, useRef, useState } from "react";

type Props = {
	project: {
		url?: string;
		title: string;
		description: string;
		repository?: string;
	};

	views: number;
};
export const Header: FC<Props> = ({ project, views }) => {
	const ref = useRef<HTMLElement>(null);
	const [isIntersecting, setIntersecting] = useState(true);

	const links: { label: string; href: string }[] = [];
	if (project.repository) {
		links.push({
			label: "GitHub",
			href: `https://github.com/${project.repository}`,
		});
	}
	if (project.url) {
		links.push({
			label: "Website",
			href: project.url,
		});
	}
	useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver(([entry]) =>
			setIntersecting(entry.isIntersecting),
		);

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	return (
		<header ref={ref} className="relative isolate overflow-hidden">
			<div
				className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] ${
					isIntersecting
						? "border-transparent bg-transparent"
						: "border-border bg-bg shadow-sm backdrop-blur-md"
				}`}
			>
				<div className="container mx-auto flex items-center justify-between px-6 py-5 motion-fade">
					<Link href="/#sparks" className="type-label ui-btn ui-btn-quiet">
						<ArrowLeft className="h-4 w-4" />
						Sparks
					</Link>

					<div className="flex items-center gap-5">
						<span
							title="View counter for this page"
							className="type-label num-tabular flex items-center gap-1 text-muted"
						>
							<Eye className="h-4 w-4" />
							{Intl.NumberFormat("en-US", { notation: "compact" }).format(
								views,
							)}
						</span>
						<Link
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Open Zhongjie Shen GitHub profile in a new tab"
							href="https://github.com/zhongjis"
							className="ui-btn ui-btn-icon text-muted"
						>
							<Github className="h-5 w-5" />
						</Link>
					</div>
				</div>
			</div>

			<div className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-16 pt-28 sm:pt-32 lg:px-10">
				<div className="mx-auto flex max-w-5xl flex-col items-center text-center">
					<div className="motion-enter mx-auto max-w-3xl">
						<p className="type-kicker motion-fade motion-delay-1 mb-4 text-accent">
							Project
						</p>
						<h1 className="type-display-lg motion-enter motion-delay-2 font-display text-fg">
							{project.title}
						</h1>
						<p className="type-lead measure motion-enter motion-delay-3 mx-auto mt-6 text-muted">
							{project.description}
						</p>
					</div>

					<div className="mx-auto mt-10 max-w-2xl lg:max-w-none">
						<div className="flex flex-wrap items-center justify-center gap-3 text-fg">
							{links.map((link) => (
								<Link
									target="_blank"
									rel="noopener noreferrer"
									key={link.label}
									href={link.href}
									className="type-label ui-btn"
								>
									{link.label} <span aria-hidden="true">{"->"}</span>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};
