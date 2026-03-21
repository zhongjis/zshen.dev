import { notFound } from "next/navigation";
import { projects } from ".velite";
import { Mdx } from "@/app/components/mdx";
import { Header } from "./header";
import "./mdx.css";
import { ReportView } from "./view";
import { Redis } from "@upstash/redis";

export const revalidate = 60;

type Params = {
  slug: string;
};

type Props = {
  params: Promise<Params>;
};

const redis = Redis.fromEnv();

export async function generateStaticParams(): Promise<Params[]> {
  return projects
    .filter((p) => p.published)
    .map((p) => ({
      slug: p.slug,
    }));
}

export default async function PostPage(props: Props) {
  const params = await props.params;
  const slug = params?.slug;
  const project = projects.find((project) => project.slug === slug);

  if (!project) {
    notFound();
  }

  const views =
    (await redis.get<number>(["pageviews", "projects", slug].join(":"))) ?? 0;

  return (
    <div className="min-h-screen">
      <Header project={project} views={views} />
      <ReportView slug={project.slug} />

      <article className="motion-enter motion-delay-2 prose prose-invert prose-zinc prose-quoteless mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <Mdx code={project.body} />
      </article>
    </div>
  );
}
