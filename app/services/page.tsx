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
						AI Tool Integration Consulting
					</h1>
					<p className="type-lead measure motion-enter motion-delay-3 mt-6 text-zinc-300">
						I help engineering teams evaluate and integrate AI into their
						workflows. Practical, intentional guidance to adopt the right tools
						without compromising technical foundations.
					</p>
				</div>

				<div className="grid w-full grid-cols-1 gap-8 lg:gap-10 motion-enter motion-delay-4">
					<Card>
						<div className="relative flex flex-col items-start gap-6 p-6 sm:p-8">
							<div className="z-10 flex flex-col">
								<span className="font-display text-[clamp(1.25rem,2.2vw,1.85rem)] leading-[1.14] tracking-[-0.01em] text-zinc-100 break-words">
									Workflow Architecture
								</span>
								<span className="type-label mt-3 text-zinc-400">
									Strategic Implementation
								</span>
							</div>
							<p className="type-body z-10 text-zinc-300">
								Determine exactly where AI tooling provides leverage and where
								it creates friction. From selecting the right developer tools to
								establishing secure usage patterns, I work with your team to
								build a tailored integration strategy that respects your
								existing context and ships real value.
							</p>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
