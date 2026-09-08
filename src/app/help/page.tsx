import { LearningIndex } from "@/components/learning";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "RankSushi help center",
  "Find help with audits, Google Search Console, DataForSEO, drafts, reports, allowances, sign-in, and recovery.",
  "/help",
);
export default function Page() {
  return <LearningIndex collection="help" />;
}
