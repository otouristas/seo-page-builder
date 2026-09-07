import { SaasLanding } from "@/components/marketing/saas-landing";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <SaasLanding />;
}
