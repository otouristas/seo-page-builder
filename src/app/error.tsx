"use client";
import { Button } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="standalone">
      <h1>Something interrupted this page.</h1>
      <p>Your saved work is still there. Try loading it again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
