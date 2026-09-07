import { AppShell } from "@/components/app/app-shell";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({ component: AppPage });

function AppPage() {
  return <AppShell />;
}
