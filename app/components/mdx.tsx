import type * as React from "react";
import * as runtime from "react/jsx-runtime";
import Link from "next/link";

function clsx(...args: (string | undefined | null | false)[]) {
	return args.filter(Boolean).join(" ");
}

const components = {
	h1: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h1
			className={clsx(
				"type-display-lg mt-2 scroll-m-20 font-display text-zinc-100",
				className,
			)}
			{...props}
		/>
	),
	h2: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h2
			className={clsx(
				"type-display-md mt-10 scroll-m-20 border-b border-b-zinc-700 pb-2 font-display text-zinc-100 first:mt-0",
				className,
			)}
			{...props}
		/>
	),
	h3: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h3
			className={clsx(
				"mt-8 scroll-m-20 text-2xl font-display text-zinc-100",
				className,
			)}
			{...props}
		/>
	),
	h4: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h4
			className={clsx(
				"mt-8 scroll-m-20 text-xl font-display text-zinc-100",
				className,
			)}
			{...props}
		/>
	),
	h5: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h5
			className={clsx(
				"mt-8 scroll-m-20 text-lg font-display text-zinc-100",
				className,
			)}
			{...props}
		/>
	),
	h6: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h6
			className={clsx(
				"mt-8 scroll-m-20 text-base font-display text-zinc-100",
				className,
			)}
			{...props}
		/>
	),
	a: ({
		className,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
		<Link
			className={clsx(
				"text-zinc-100 underline decoration-[#d8a55f]/70 underline-offset-4 transition-all duration-200 hover:text-[#d8a55f] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d8a55f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191c28]",
				className,
			)}
			{...(props as React.ComponentProps<typeof Link>)}
		/>
	),
	p: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLParagraphElement>) => (
		<p
			className={clsx("type-body leading-7 text-zinc-300 [&:not(:first-child)]:mt-6", className)}
			{...props}
		/>
	),
	ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
		<ul className={clsx("my-6 ml-6 list-disc", className)} {...props} />
	),
	ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
		<ol className={clsx("my-6 ml-6 list-decimal", className)} {...props} />
	),
	li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
		<li className={clsx("mt-2", className)} {...props} />
	),
	blockquote: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLQuoteElement>) => (
		<blockquote
			className={clsx(
				"mt-6 border-l-2 border-[#d8a55f]/60 pl-6 italic text-zinc-300 [&>*]:text-zinc-300",
				className,
			)}
			{...props}
		/>
	),
	hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
	<hr className="my-4 border-zinc-700 md:my-8" {...props} />
	),
	table: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLTableElement>) => (
		<div className="w-full my-6 overflow-y-auto">
			<table className={clsx("w-full", className)} {...props} />
		</div>
	),
	tr: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLTableRowElement>) => (
		<tr
			className={clsx(
				"m-0 border-t border-zinc-700 p-0 even:bg-zinc-800/35",
				className,
			)}
			{...props}
		/>
	),
	th: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLTableCellElement>) => (
		<th
			className={clsx(
				"border border-zinc-700 px-4 py-2 text-left font-semibold text-zinc-100 [&[align=center]]:text-center [&[align=right]]:text-right",
				className,
			)}
			{...props}
		/>
	),
	td: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLTableCellElement>) => (
		<td
			className={clsx(
				"border border-zinc-700 px-4 py-2 text-left text-zinc-300 [&[align=center]]:text-center [&[align=right]]:text-right",
				className,
			)}
			{...props}
		/>
	),
	pre: ({
		className,
		...props
	}: React.HTMLAttributes<HTMLPreElement>) => (
		<pre
			className={clsx(
				"mt-6 mb-4 overflow-x-auto rounded-lg bg-zinc-900 py-4",
				className,
			)}
			{...props}
		/>
	),
	code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
		<code
			className={clsx(
				"relative rounded border border-zinc-700 bg-zinc-800/60 px-[0.36rem] py-[0.2rem] font-mono text-sm text-zinc-200",
				className,
			)}
			{...props}
		/>
	),
};

/**
 * Parse Velite-compiled MDX code into a React component.
 * Velite's s.mdx() outputs a function-body string that expects
 * the JSX runtime as arguments[0].
 */
function useMDXComponent(code: string) {
	const fn = new Function(code);
	return fn({ ...runtime }).default;
}

interface MdxProps {
	code: string;
}

export function Mdx({ code }: MdxProps) {
	const Component = useMDXComponent(code);

	return (
		<div className="mdx">
			<Component components={components} />
		</div>
	);
}
