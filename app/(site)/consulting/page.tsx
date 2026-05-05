import { ContactTrigger } from "@/app/(site)/_components/contact-trigger";

const consulting = [
	{
		title: "AI tooling",
		description:
			"Shape agent workflows, eval loops, and internal tools that make AI work reliable.",
		meta: "Contact",
		action: "Highlight contact links",
	},
	{
		title: "Software Contracting",
		description:
			"Build focused product surfaces and backend systems for complex enterprise work.",
		meta: "Contact",
		action: "Highlight contact links",
	},
	{
		title: "Home Lab",
		description:
			"Design rebuildable infrastructure on K3s and Nix, from machines to day-two operations.",
		meta: "Contact",
		action: "Highlight contact links",
	},
];

function twoDigit(index: number) {
	return String(index + 1).padStart(2, "0");
}

export default function ConsultingPage() {
	return (
		<section
			className="route-panel motion-enter motion-delay-1"
			aria-labelledby="consulting-title"
		>
			<header className="panel-head">
				<div>
					<p className="type-kicker">Consulting</p>
					<h2 id="consulting-title">Need a helping hand?</h2>
				</div>
			</header>
			<div className="portfolio-list consulting-list">
				{consulting.map((item, index) => (
					<ContactTrigger
						key={item.title}
						index={twoDigit(index)}
						title={item.title}
						description={item.description}
						meta={item.meta}
						action={item.action}
					/>
				))}
			</div>
		</section>
	);
}
