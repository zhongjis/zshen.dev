"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FC } from "react";

export const Navigation: FC = () => {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIntersecting] = useState(true);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting),
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={ref}>
      <div
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] ${
          isIntersecting
            ? "bg-transparent border-transparent"
            : "bg-[#0a0d14]/80 backdrop-blur-xl border-[#2a3247]"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-5 motion-fade">
          <Link
            href="/"
            className="type-label inline-flex items-center gap-2 rounded-full text-zinc-200 transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] hover:-translate-x-0.5 hover:text-white active:scale-[0.98] motion-reduce:hover:translate-x-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a55f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e16]"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-[#2c3449] bg-[#11182a]/85 p-1.5">
            <Link
              href="/projects"
              className="type-label rounded-full px-4 py-1.5 text-zinc-300 transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-[#212a3f] hover:text-white active:scale-[0.98] motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a55f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e16]"
            >
              Projects
            </Link>
            <Link
              href="/contact"
              className="type-label rounded-full px-4 py-1.5 text-zinc-300 transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-[#212a3f] hover:text-white active:scale-[0.98] motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a55f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e16]"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
