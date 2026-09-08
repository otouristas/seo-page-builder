import { COLLECTIONS } from "@/lib/learning/content";
import { markdownResponse } from "@/lib/learning/exports";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return COLLECTIONS.blog.map((a) => ({ slug: a.slug }));
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return markdownResponse("blog", slug, false);
}
