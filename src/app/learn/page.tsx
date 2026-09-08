import { LearningIndex } from "@/components/learning";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "The SEO kitchen: practical SEO, AEO & GEO guides",
  "Search practical guides to technical SEO, content planning, answer readiness, and measurement. Take a checklist into your next useful change.",
  "/learn",
);
export default function Page() {
  return <LearningIndex collection="learn" />;
}
