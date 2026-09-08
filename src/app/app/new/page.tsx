import { Onboarding } from "@/components/auth";
export default async function NewProject({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  return <Onboarding website={p.website} plan={p.plan} />;
}
