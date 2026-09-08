import { LearningIndex } from "@/components/learning";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Fresh reads: the RankSushi blog",
  "Practical ideas for SEO, AI visibility, content workflows, and measurement. Clear methods and useful next steps from RankSushi.",
  "/blog",
);
export default function Page() {
  return <LearningIndex collection="blog" />;
}
