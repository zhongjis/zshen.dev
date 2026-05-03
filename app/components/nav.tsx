"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FC, useEffect, useRef, useState } from "react";

export const Navigation: FC = () => {
	const ref = useRef<HTMLElement>(null);
	const pathname = usePathname();
	const [isIntersecting, setIntersecting] = useState(true);

	useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver(([entry]) =>
			setIntersecting(entry.isIntersecting),
		);

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	return (
		<header ref={ref}>
			<div
				className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] ${
					isIntersecting
						? "border-transparent bg-transparent"
						: "border-border bg-bg shadow-sm backdrop-blur-md"
				}`}
			>
				<div className="container mx-auto flex items-center justify-between px-6 py-4 motion-fade">
					<Link href="/" className="type-label ui-btn ui-btn-quiet -ml-3">
						<ArrowLeft className="h-4 w-4" />
						Home
					</Link>

					<div className="flex items-center gap-1 sm:gap-2">
						<Link
							href="/services"
							aria-current={pathname === "/services" ? "page" : undefined}
							className={`type-label ui-btn ui-btn-quiet ${
								pathname === "/services" ? "is-active" : "text-muted"
							}`}
						>
							Services
						</Link>
						<Link
							href="/projects"
							aria-current={pathname === "/projects" ? "page" : undefined}
							className={`type-label ui-btn ui-btn-quiet ${
								pathname === "/projects" ? "is-active" : "text-muted"
							}`}
						>
							Projects
						</Link>
						<Link
							href="/contact"
							aria-current={pathname === "/contact" ? "page" : undefined}
							className={`type-label ui-btn ui-btn-quiet ${
								pathname === "/contact" ? "is-active" : "text-muted"
							}`}
						>
							Contact
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
};
