import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/content";
import { PublicArticlePage } from "@/components/public-article";
import { pageMetadata } from "@/lib/metadata";
export function generateStaticParams() {
  return Object.keys(FEATURES).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = FEATURES[slug];
  return a ? pageMetadata(a.title, a.description, `/features/${slug}`) : {};
}
export default async function Feature({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = FEATURES[slug];
  if (!a) notFound();
  return <PublicArticlePage article={a} feature />;
}
