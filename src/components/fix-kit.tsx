"use client";
import { useId, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Copy, Wrench } from "lucide-react";
import Link from "next/link";
import { CopyActions, CopyButton } from "./copy-actions";
import { recipeFor } from "@/lib/fixes/recipes";
import {
  AUDIENCES,
  fixPrompt,
  type FixAudience,
  type FixContext,
} from "@/lib/fixes/prompts";
export function FixKit({
  context,
  expanded = false,
}: {
  context: FixContext;
  expanded?: boolean;
}) {
  const [audience, setAudience] = useState<FixAudience>("editor");
  const recipe = recipeFor(context.key),
    id = useId();
  const prompt = fixPrompt(context, audience);
  return (
    <details className="fix-kit" open={expanded || undefined}>
      <summary>
        <span>
          <Wrench size={15} />
          Help me fix this
        </span>
        <span>
          Steps & copyable prompts <ChevronDown size={14} />
        </span>
      </summary>
      <div className="fix-kit-content">
        <div className="fix-kit-heading">
          <div>
            <span className="eyebrow">ONE CHANGE. A CLEAR NEXT STEP.</span>
            <h3>{recipe.label}</h3>
          </div>
          <Link href="/help/fix-prompts">
            How this works <ArrowUpRight size={12} />
          </Link>
        </div>
        <div
          className="fix-audiences"
          role="group"
          aria-label="How you will make this change"
        >
          {Object.entries(AUDIENCES).map(([key, label]) => (
            <button
              type="button"
              key={key}
              aria-pressed={audience === key}
              onClick={() => setAudience(key as FixAudience)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="fix-location">
          <strong>Where to look</strong>
          {recipe.location}
        </p>
        {context.status === "unknown" && (
          <p className="fix-context-note">
            This needs investigation first. We do not yet know that a website
            change is needed.
          </p>
        )}
        {["pass", "not-applicable"].includes(context.status || "") && (
          <p className="fix-context-note">
            This check does not currently need a fix. Use these instructions
            only if your review finds a real issue.
          </p>
        )}
        {audience === "editor" ? (
          <ol className="fix-steps">
            {recipe.steps.map((step, i) => (
              <li key={step}>
                <span>{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="fix-prompt-box">
            <div className="fix-prompt-toolbar">
              <span>
              <Copy size={13} />
              {audience === "assistant"
                ? "Ready for ChatGPT, Claude, Codex or Cursor"
                : "A handoff your developer can use"}
              </span>
              <CopyButton text={prompt} label="Copy prompt" />
            </div>
            <label className="sr-only" htmlFor={id}>
              Fix prompt preview
            </label>
            <textarea id={id} value={prompt} readOnly rows={8} />
          </div>
        )}
        <p className="fix-context-note">{recipe.caution}</p>
        <div className="fix-done">
          <Check size={17} />
          <div>
            <strong>You’re done when</strong>
            <p>{recipe.check}</p>
          </div>
        </div>
        <div className="fix-kit-footer">
          <CopyActions
            text={prompt}
            prompt={fixPrompt(context, "assistant")}
            steps={fixPrompt(context, "editor")}
            label={
              audience === "editor"
                ? "Copy instructions"
                : audience === "developer"
                  ? "Copy handoff"
                  : "Copy fix prompt"
            }
            filename={`ranksushi-${context.key}-fix.md`}
          />
          <span>Copying does not change your website.</span>
        </div>
      </div>
    </details>
  );
}
