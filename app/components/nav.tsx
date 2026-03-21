"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FC } from "react";

export const Navigation: FC = () => {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
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
            className="type-label ui-btn ui-btn-quiet"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-[#2c3449] bg-[#11182a]/85 p-1.5">
            <Link
              href="/projects"
              aria-current={pathname === "/projects" ? "page" : undefined}
              className={`type-label ui-btn px-4 ${
                pathname === "/projects"
                  ? "is-active"
                  : "text-zinc-300"
              }`}
            >
              Projects
            </Link>
            <Link
              href="/contact"
              aria-current={pathname === "/contact" ? "page" : undefined}
              className={`type-label ui-btn px-4 ${
                pathname === "/contact"
                  ? "is-active"
                  : "text-zinc-300"
              }`}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
