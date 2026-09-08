import { notFound } from "next/navigation";
import { ARTICLES } from "@/lib/content";
import { PublicArticlePage } from "@/components/public-article";
import { pageMetadata } from "@/lib/metadata";
export function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = ARTICLES[slug];
  return a ? pageMetadata(a.title, a.description, `/${slug}`) : {};
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = ARTICLES[slug];
  if (!a) notFound();
  return <PublicArticlePage article={a} />;
}
