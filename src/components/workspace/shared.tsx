"use client";
import { useEffect, useRef, type ReactNode } from "react";
import {
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "../ui";
import { FixKit } from "../fix-kit";
import Link from "next/link";
import { guideForFinding } from "@/lib/learning/guide-links";
import type { AuditFinding } from "@/lib/types";
export async function request<T = Record<string, unknown>>(
  url: string,
  body?: unknown,
  method = body ? "POST" : "GET",
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(method === "POST" ? { "Idempotency-Key": crypto.randomUUID() } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response
    .json()
    .catch(() => ({ error: "The request could not be completed." }));
  if (!response.ok)
    throw new Error(data.error || "The request could not be completed.");
  return data as T;
}
export function download(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="native-modal modal"
      onCancel={onClose}
      aria-labelledby="dialog-title"
    >
      <div className="modal-head">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <Info size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />
      {children}
    </div>
  );
}
export function Finding({ finding }: { finding: AuditFinding }) {
  const f = finding;
  const guide = guideForFinding(f.id);
  const Icon =
    f.status === "pass"
      ? CheckCircle2
      : ["warning", "fail"].includes(f.status)
        ? AlertCircle
        : HelpCircle;
  return (
    <article className="finding-item">
      <h3>
        <Icon size={17} />
        {f.title}
        <Badge
          tone={
            f.status === "pass"
              ? "green"
              : f.status === "fail"
                ? "red"
                : f.status === "warning"
                  ? "orange"
                  : "neutral"
          }
        >
          {f.status.replace("-", " ")}
        </Badge>
      </h3>
      <p>{f.detail}</p>
      <p className="recommendation">{f.recommendation}</p>
      <Link
        href={`/learn/${guide.slug}`}
        className="knowledge-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {guide.label}
        <ArrowUpRight size={13} aria-hidden="true" />
      </Link>
      <FixKit
        context={{
          key: f.id,
          title: f.title,
          url: f.evidence.url,
          detail: f.detail,
          recommendation: f.recommendation,
          status: f.status,
          evidence: f.evidence,
        }}
      />
      <div className="finding-evidence">
        {f.evidence.source} · {f.evidence.status} ·{" "}
        {new Date(f.evidence.observedAt).toLocaleString("en-US")}
        <br />
        {f.evidence.url}
      </div>
    </article>
  );
}
export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  let safe = false;
  try {
    safe = ["https:", "http:"].includes(new URL(href).protocol);
  } catch {}
  return safe ? (
    <a
      className="text-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={13} />
    </a>
  ) : (
    <span>{children}</span>
  );
}
