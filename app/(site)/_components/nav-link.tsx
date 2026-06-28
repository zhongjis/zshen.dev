"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

type NavLinkProps = {
	href: string;
	children: React.ReactNode;
};

export function NavLink({ href, children }: NavLinkProps) {
	const pathname = usePathname();
	const isActive =
		href === "/"
			? pathname === href
			: pathname === href || pathname.startsWith(`${href}/`);

	return (
		<Link href={href} className={`side-link ${isActive ? "is-active" : ""}`}>
			{children}
		</Link>
	);
}
