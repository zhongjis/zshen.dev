import type { PropsWithChildren, ReactNode } from "react";

type MdxComponent = (props: { children?: ReactNode }) => ReactNode;
type MdxComponents = Record<string, MdxComponent>;

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MdxComponents): MdxComponents {
	return {
		// Allows customizing built-in components, e.g. to add styling.
		h1: ({ children }: PropsWithChildren) => (
			<h1 className="type-display-md mt-2 font-display text-zinc-100 md:text-center">
				{children}
			</h1>
		),
		h2: ({ children }: PropsWithChildren) => (
			<h2 className="type-display-md mt-8 font-display text-zinc-50">{children}</h2>
		),
		...components,
	};
}
