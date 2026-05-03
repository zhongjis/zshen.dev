"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type FC, useEffect, useRef, useState } from "react";

export const Navigation: FC = () => {
	const ref = useRef<HTMLElement>(null);
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
				</div>
			</div>
		</header>
	);
};
