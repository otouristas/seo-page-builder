import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export const metadata = {
  title: "Your workspace",
  robots: { index: false, follow: false },
  alternates: { canonical: "/app" },
};
export const dynamic = "force-dynamic";
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login");
  return children;
}
