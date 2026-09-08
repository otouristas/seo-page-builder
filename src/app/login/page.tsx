import { LoginForm } from "@/components/auth";
export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const next = p.next?.startsWith("/app")
    ? p.next
    : p.website
      ? `/app/new?website=${encodeURIComponent(p.website)}`
      : p.plan
        ? `/app/new?plan=${encodeURIComponent(p.plan)}`
        : "/app";
  return <LoginForm next={next} expired={p.error === "expired"} />;
}
