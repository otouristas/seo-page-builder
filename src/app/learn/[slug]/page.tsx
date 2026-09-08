import { notFound } from "next/navigation";
import { LearningArticlePage } from "@/components/learning";
import { COLLECTIONS, getArticle } from "@/lib/learning/content";
import { pageMetadata } from "@/lib/metadata";
export const dynamicParams = false;
export function generateStaticParams() {
  return COLLECTIONS.learn.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle("learn", slug);
  if (!a) return {};
  const metadata = pageMetadata(a.title, a.description, `/learn/${slug}`);
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: { "text/markdown": `/learn/${slug}/index.md` },
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle("learn", slug);
  if (!a) notFound();
  return <LearningArticlePage collection="learn" article={a} />;
}
