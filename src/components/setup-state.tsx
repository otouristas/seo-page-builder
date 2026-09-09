import Link from "next/link";
import { Maki, Logo } from "./maki";
import { ButtonLink } from "./ui";
export function SetupState() {
  return (
    <main id="main" className="standalone">
      <Link href="/">
        <Logo />
      </Link>
      <Maki pose="thinking" motion="cook" />
      <h1>Your workspace is warming up.</h1>
      <p>
        Your account is signed in, but the workspace database could not be
        reached. Please try again shortly. The example workspace is available
        while setup is completed.
      </p>
      <div className="toolbar">
        <ButtonLink href="/app">Try again</ButtonLink>
        <ButtonLink href="/demo" variant="secondary">
          Explore the example
        </ButtonLink>
      </div>
    </main>
  );
}
