import Link from "next/link";
import Particles from "./components/particles";

const navigation = [
	{ name: "Services", href: "/services" },
	{ name: "Projects", href: "/projects" },
	{ name: "Contact", href: "/contact" },
];

export default function Home() {
	return (
		<div className="relative overflow-hidden">
			<Particles
				className="absolute inset-0 -z-10 opacity-70"
				quantity={90}
				staticity={70}
			/>

			<div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-24 sm:px-10 lg:px-16">
				<nav className="motion-enter mb-20 flex flex-wrap items-center gap-3">
					{navigation.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="type-label ui-btn"
						>
							{item.name}
						</Link>
					))}
				</nav>

				<div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
					<div className="motion-enter motion-delay-1">
						<p className="motion-fade motion-delay-2 type-kicker mb-6 text-[#d8a55f]">
							Technical. Refined. Human.
						</p>
						<h1 className="text-edge-outline type-display-xl motion-enter motion-delay-3 font-display text-transparent bg-gradient-to-b from-[#f0f4fe] to-[#a7b5d8] bg-clip-text">
							zshen
						</h1>
						<p className="type-lead measure motion-enter motion-delay-4 mt-8 text-zinc-300">
							I build products with strong technical foundations and intentional
							taste. This site is a living record of how I think, design, and
							ship.
						</p>
					</div>

					<div className="motion-enter motion-delay-5 rounded-3xl border border-[#2e3a55] bg-[#212633]/85 p-6 backdrop-blur-sm transition-transform duration-500 [transition-timing-function:var(--ease-out-quint)] hover:-translate-y-1 sm:p-8">
						<p className="type-label text-zinc-400">Current focus</p>
						<p className="type-display-md mt-4 font-display text-zinc-100">
							Trust my taste through shipped work.
						</p>
						<p className="type-body-sm mt-4 text-zinc-400">
							Based in South Bay. Product-minded engineering with a bias toward
							clarity, momentum, and craft.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
