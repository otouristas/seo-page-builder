"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Globe2 } from "lucide-react";
export function UrlForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  return (
    <form
      className="hero-form"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/tools/seo-audit?url=${encodeURIComponent(url.trim())}`);
      }}
    >
      <Globe2 size={17} color="#859178" />
      <label className="sr-only" htmlFor="hero-url">
        Your website URL
      </label>
      <input
        id="hero-url"
        name="url"
        placeholder="Your website URL goes here"
        required
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        autoComplete="url"
      />
      <button className="button primary" type="submit">
        Find my next bite <ArrowRight size={16} />
      </button>
    </form>
  );
}
