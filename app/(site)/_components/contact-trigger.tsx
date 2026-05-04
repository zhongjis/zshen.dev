"use client";

type ContactTriggerProps = {
	index: string;
	title: string;
	description: string;
	meta: string;
	action: string;
};

const easeOutQuart = "cubic-bezier(0.25, 1, 0.5, 1)";

export function ContactTrigger({
	index,
	title,
	description,
	meta,
	action,
}: ContactTriggerProps) {
	function pulseContactLinks() {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		for (const link of document.querySelectorAll<HTMLElement>(
			".contact-link",
		)) {
			link.animate(
				[
					{
						color: "var(--stone)",
						opacity: 0.58,
						transform: "translateY(0) scale(1)",
						offset: 0,
					},
					{
						color: "var(--accent)",
						opacity: 1,
						transform: "translateY(-2px) scale(1.08)",
						offset: 0.32,
					},
					{
						color: "var(--accent)",
						opacity: 1,
						transform: "translateY(-2px) scale(1.08)",
						offset: 0.72,
					},
					{
						color: "var(--stone)",
						opacity: 1,
						transform: "translateY(0) scale(1)",
						offset: 1,
					},
				],
				{ duration: 920, easing: easeOutQuart },
			);
		}
	}

	return (
		<button
			type="button"
			className="portfolio-row consulting-row contact-trigger group"
			aria-label={`${action}: ${title}`}
			onClick={pulseContactLinks}
		>
			<span className="num">{index}</span>
			<div className="row-copy">
				<h3>{title}</h3>
				<p>{description}</p>
			</div>
			<span className="small-meta row-meta">{meta}</span>
		</button>
	);
}
