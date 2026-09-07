import { useNavigate } from "@tanstack/react-router";
import { Aurora, Container, DotGrid, Noise } from "@/components/patterns";
import { UrlField } from "@/components/ui/url-field";
import { ButtonLink } from "@/components/ui/button";

export function CtaBand() {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden py-28">
      <DotGrid className="mask-radial opacity-60" />
      <Aurora intensity={0.9} />
      <Noise />
      <Container className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Your page is somewhere on that results page. Find out where.</h2>
        <p className="mt-4 text-lg text-fg-muted">Sixty seconds from URL to scene. No account needed.</p>
        <UrlField className="mx-auto mt-8 max-w-xl text-left" onSubmit={(url) => navigate({ to: "/app", search: { url } })} buttonLabel="Run the lab" />
        <div className="mt-5 text-[13px] text-fg-muted">
          <ButtonLink to="/login" variant="ghost" size="sm">
            Sign in with Google to keep your data
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
