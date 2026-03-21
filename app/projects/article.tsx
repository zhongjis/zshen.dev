import type { Project } from ".velite";
import Link from "next/link";
import { Eye } from "lucide-react";
import type { FC } from "react";

type Props = {
  project: Project;
  views: number;
};

export const Article: FC<Props> = ({ project, views }) => {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block focus-visible:rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a55f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e16]"
    >
      <article className="p-6 transition-transform duration-300 [transition-timing-function:var(--ease-out-quart)] group-hover:-translate-y-1 motion-reduce:transform-none md:p-8">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.18em] text-zinc-400 transition-colors group-hover:text-zinc-200">
            {project.date ? (
              <time dateTime={new Date(project.date).toISOString()}>
                {Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                  new Date(project.date),
                )}
              </time>
            ) : (
              <span>SOON</span>
            )}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Eye className="w-4 h-4" />{" "}
            {Intl.NumberFormat("en-US", { notation: "compact" }).format(views)}
          </span>
        </div>

        <h2 className="z-20 mt-4 text-2xl font-display text-zinc-100 transition-colors group-hover:text-white lg:text-3xl">
          {project.title}
        </h2>
        <p className="z-20 mt-4 text-sm leading-relaxed text-zinc-400 transition-colors group-hover:text-zinc-200">
          {project.description}
        </p>

        <span className="mt-8 inline-block text-xs uppercase tracking-[0.2em] text-[#d8a55f] transition-transform duration-300 [transition-timing-function:var(--ease-out-quart)] group-hover:translate-x-1 motion-reduce:transform-none">
          Read more {"->"}
        </span>
      </article>
    </Link>
  );
};
