import { SiteShell } from "./_components/site-shell";

export default function SiteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SiteShell>{children}</SiteShell>;
}
