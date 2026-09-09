"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  ArrowUpRight,
  Code2,
  X,
} from "lucide-react";
export function CopyActions({
  text,
  prompt = text,
  steps,
  markdownUrl,
  filename = "ranksushi-instructions.md",
  label = "Copy page",
}: {
  text: string;
  prompt?: string;
  steps?: string;
  markdownUrl?: string;
  filename?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(""),
    [fallback, setFallback] = useState("");
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const copy = async (value: string, note = "Copied. Ready to paste.") => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(value);
      setMessage(note);
    } catch {
      setMessage(
        "Clipboard access was unavailable. Select the text to copy it.",
      );
      setFallback(value);
    }
  };
  const openAssistant = (url: string, name: string) => {
    // Open synchronously from the click so popup blockers do not swallow the
    // handoff. The prompt is copied separately because external apps cannot be
    // safely or reliably auto-filled by a browser tab.
    window.open(url, "_blank", "noopener,noreferrer");
    void copy(prompt, `Prompt copied. ${name} is open — paste to continue.`);
  };
  const save = () => {
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setOpen(false);
  };
  return (
    <div
      className="copy-actions"
      ref={root}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <div className="copy-split">
        <button type="button" onClick={() => void copy(text)}>
          <Copy size={14} />
          {label}
        </button>
        <button
          type="button"
          ref={trigger}
          aria-label="More copy options"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          <ChevronDown size={14} />
        </button>
      </div>
      {open && (
        <div
          className="copy-options"
          id={id}
          role="group"
          aria-label="Copy and use options"
        >
          <span className="copy-menu-label">TAKE THE NEXT STEP</span>
          <button type="button" onClick={() => void copy(prompt)}>
            <Code2 size={15} />
            Copy AI fix prompt
          </button>
          {steps && (
            <button type="button" onClick={() => void copy(steps)}>
              <Check size={15} />
              Copy step-by-step instructions
            </button>
          )}
          <button type="button" onClick={() => openAssistant("https://chatgpt.com/", "ChatGPT")}>
            <Copy size={15} />
            Copy prompt & open ChatGPT <ArrowUpRight size={14} />
          </button>
          <button type="button" onClick={() => openAssistant("https://claude.ai/new", "Claude")}>
            <Copy size={15} />
            Copy prompt & open Claude <ArrowUpRight size={14} />
          </button>
          <p>We copy first, then open the assistant. Paste and submit when you are ready.</p>
          <div className="copy-menu-divider" />
          <button type="button" onClick={save}>
            <Download size={15} />
            Download Markdown
          </button>
          {markdownUrl && (
            <a href={markdownUrl}>
              <FileText size={15} />
              View as Markdown <ArrowUpRight size={13} />
            </a>
          )}
        </div>
      )}
      {message && (
        <p className="copy-feedback" role="status">
          {message}
        </p>
      )}
      {fallback && (
        <CopyFallback value={fallback} onClose={() => setFallback("")} />
      )}
    </div>
  );
}
export function CopyButton({
  text,
  label = "Copy prompt",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <span className="copy-button-wrap">
      <button
        type="button"
        className="copy-inline-button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setMessage("Ready to paste");
            window.setTimeout(() => setCopied(false), 1800);
          } catch {
            setMessage("Select the prompt below to copy it");
          }
        }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copied" : label}
      </button>
      {message && (
        <span className="copy-inline-status" role="status">
          {message}
        </span>
      )}
    </span>
  );
}
function CopyFallback({
  value,
  onClose,
}: {
  value: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    area = useRef<HTMLTextAreaElement>(null),
    id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    area.current?.focus();
    area.current?.select();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="copy-fallback"
      aria-labelledby={id}
      onCancel={onClose}
    >
      <div>
        <h2 id={id}>Your text is ready</h2>
        <button type="button" onClick={onClose} aria-label="Close copy dialog">
          <X size={20} />
        </button>
      </div>
      <p>
        Your browser did not allow clipboard access. Select the text, then use
        your device’s Copy command.
      </p>
      <textarea
        ref={area}
        aria-label="Text to copy manually"
        value={value}
        readOnly
        rows={12}
      />
      <button
        type="button"
        className="button secondary"
        onClick={() => {
          area.current?.focus();
          area.current?.select();
        }}
      >
        Select all text
      </button>
    </dialog>
  );
}
