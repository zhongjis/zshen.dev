import Link from "next/link";
import { Navigation } from "./components/nav";

export default function NotFound() {
  return (
    <div className="relative min-h-screen pb-20">
      <Navigation />

      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-start justify-center px-6 pt-28 sm:pt-32 lg:px-10">
        <p className="type-kicker text-[#d8a55f]">404</p>
        <h1 className="type-display-lg mt-4 font-display text-zinc-100">
          This page is not in the archive.
        </h1>
        <p className="type-lead measure mt-6 text-zinc-300">
          The link might be old, or the page has moved. Jump back to the
          projects index and continue browsing.
        </p>
        <Link
          href="/projects"
          className="type-label mt-10 inline-flex min-h-11 items-center rounded-full border border-[#33405a] bg-[#121a2d]/80 px-5 py-2 text-zinc-200 transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] hover:-translate-y-0.5 hover:border-[#d8a55f]/70 hover:text-white motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a55f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e16]"
        >
          Back to projects {"->"}
        </Link>
      </div>
    </div>
  );
}
