import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Logo, Maki } from "./maki";
import { ButtonLink, SectionLabel } from "./ui";
import { PLANS, PAID_PLANS, planLabel } from "@/lib/plans";
import { SiteMark } from "./site-mark";
import type { Project } from "@/lib/types";
/**
 * Shown instead of the create-project form when the workspace already uses its
 * project allowance, so the allowance is explained before anything is typed.
 */
export function ProjectLimit({
  projects,
  plan,
  phase,
  limit,
}: {
  projects: Pick<Project, "id" | "name" | "url" | "logo">[];
  plan: string;
  phase?: "free" | "trial" | "paid";
  limit: number;
}) {
  const next = PAID_PLANS.find((id) => PLANS[id].limits.projects > limit);
  const billing = `/app/${projects[0]?.id}/settings?tab=billing`;
  return (
    <div className="onboarding-wrap">
      <header className="container site-header">
        <Link href="/">
          <Logo />
        </Link>
        <span className="small-note">
          You’re signed in. Your workspace is ready.
        </span>
      </header>
      <main id="main" className="onboarding-grid container">
        <div className="onboarding-copy">
          <SectionLabel>Your table is already set</SectionLabel>
          <h1>
            One website per plate.
            <br />
            Yours is already served.
          </h1>
          <p>
            Your {planLabel(plan, phase)} plan includes {limit} project
            {limit === 1 ? "" : "s"}, and this workspace already uses{" "}
            {limit === 1 ? "it" : "them"}. Nothing was lost — open the project
            below, or add more plates with a larger plan.
          </p>
          <div className="onboarding-mascot">
            <Maki pose="thinking" />
            <span className="onboarding-mascot-note">
              Maki says: no new plate needed. Your work is right where you left
              it.
            </span>
          </div>
          <ul className="onboarding-checks">
            <li>
              <Check size={16} /> Your existing projects and evidence are
              untouched
            </li>
            <li>
              <Check size={16} /> Nothing was charged and no allowance was used
            </li>
            <li>
              <Check size={16} /> Upgrading adds websites from your next billing
              period
            </li>
          </ul>
        </div>
        <div className="onboarding-form panel">
          <h2>Open a project you already have</h2>
          <p>
            Every website you have added to this workspace, ready when you are.
          </p>
          <ul className="project-choice-list">
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/app/${project.id}`}>
                  <SiteMark name={project.name} logo={project.logo} />
                  <span>
                    <strong>{project.name}</strong>
                    <small>{hostname(project.url)}</small>
                  </span>
                  <ArrowUpRight size={16} />
                </Link>
              </li>
            ))}
          </ul>
          {next && (
            <div className="plan-upsell">
              <Sparkles size={15} />
              <div>
                <strong>Need another website?</strong>
                <p>
                  {PLANS[next].name} covers {PLANS[next].limits.projects}{" "}
                  projects at ${PLANS[next].price} per month.
                </p>
              </div>
            </div>
          )}
          <div className="toolbar">
            <ButtonLink href={billing}>
              See plans &amp; upgrade <ArrowUpRight size={15} />
            </ButtonLink>
            <ButtonLink href="/app" variant="secondary">
              Back to my workspace
            </ButtonLink>
          </div>
          <p className="small-note" style={{ marginTop: 15 }}>
            Plan changes take effect from your next billing period. Allowances
            are shared across every project in the workspace.
          </p>
        </div>
      </main>
    </div>
  );
}
function hostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
