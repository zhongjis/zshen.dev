import Link from "next/link";
import { Card } from "../components/card";
import { Navigation } from "../components/nav";

export default function ServicesPage() {
	return (
		<div className="relative min-h-screen pb-20">
			<Navigation />
			<div className="container mx-auto px-6 pt-28 sm:pt-32 lg:px-10">
				<div className="mb-14 max-w-3xl motion-enter">
					<p className="type-kicker motion-fade motion-delay-1 text-[#d8a55f]">
						Services
					</p>
					<h1 className="type-display-lg motion-enter motion-delay-2 mt-4 font-display text-zinc-100">
						AI tooling that fits how your team works.
					</h1>
					<p className="type-lead measure motion-enter motion-delay-3 mt-6 text-zinc-300">
						I help teams decide where AI belongs in the workflow, choose the
						right tools, and put practical guardrails around adoption without
						slowing delivery.
					</p>
				</div>

				<div className="grid w-full grid-cols-1 gap-8 lg:gap-10 motion-enter motion-delay-4">
					<Card>
						<div className="relative flex flex-col items-start gap-6 p-6 sm:p-8">
							<div className="z-10 flex flex-col">
								<span className="font-display text-[clamp(1.25rem,2.2vw,1.85rem)] leading-[1.14] tracking-[-0.01em] text-zinc-100 break-words">
									Workflow design
								</span>
								<span className="type-label mt-3 text-zinc-400">
									Tooling and guardrails
								</span>
							</div>
							<p className="type-body z-10 text-zinc-300">
								We map where AI actually helps, where it adds drag, and what
								needs review, policy, or human judgment. The result is a setup
								that matches your team, your stack, and the way you ship.
							</p>
							<Link href="/contact" className="type-label ui-btn">
								Contact
							</Link>
						</div>
					</Card>
					<Card>
						<div className="relative flex flex-col items-start gap-6 p-6 sm:p-8">
							<div className="z-10 flex flex-col">
								<span className="font-display text-[clamp(1.25rem,2.2vw,1.85rem)] leading-[1.14] tracking-[-0.01em] text-zinc-100 break-words">
									Pilot planning
								</span>
								<span className="type-label mt-3 text-zinc-400">
									Rollout and measurement
								</span>
							</div>
							<p className="type-body z-10 text-zinc-300">
								We define a first rollout that is small enough to ship, measurable
								enough to learn from, and practical enough to expand if it works.
							</p>
							<Link href="/contact" className="type-label ui-btn">
								Contact
							</Link>
						</div>
					</Card>
					<Card>
						<div className="relative flex flex-col items-start gap-6 p-6 sm:p-8">
							<div className="z-10 flex flex-col">
								<span className="font-display text-[clamp(1.25rem,2.2vw,1.85rem)] leading-[1.14] tracking-[-0.01em] text-zinc-100 break-words">
									Team enablement
								</span>
								<span className="type-label mt-3 text-zinc-400">
									Training and operating norms
								</span>
							</div>
							<p className="type-body z-10 text-zinc-300">
								I help teams build shared habits around prompting, review, and
								tool choice so adoption stays useful after the first launch.
							</p>
							<Link href="/contact" className="type-label ui-btn">
								Contact
							</Link>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
