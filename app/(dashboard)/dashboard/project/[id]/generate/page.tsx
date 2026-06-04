"use client";

import { Suspense, useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Copy, Download, CheckCircle, ArrowLeft, Star } from "lucide-react";
import type { DeliverableType } from "@/types";

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return <h1 key={i} className="font-display font-bold text-xl text-ink mt-6 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="font-display font-semibold text-base text-ink mt-5 mb-2 pb-1 border-b border-line">{line.slice(3)}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={i} className="font-display font-semibold text-sm text-ink mt-4 mb-1">{line.slice(4)}</h3>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-ink-2 leading-relaxed">
              <span className="text-accent mt-1 flex-shrink-0">→</span>
              <span>{formatInline(line.slice(2))}</span>
            </div>
          );
        }
        if (line.match(/^\d+\. /)) {
          const num = line.match(/^(\d+)\. /)?.[1];
          return (
            <div key={i} className="flex items-start gap-3 text-sm text-ink-2 leading-relaxed">
              <span className="font-mono text-xs text-ink-3 bg-paper-2 rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">{num}</span>
              <span>{formatInline(line.replace(/^\d+\. /, ""))}</span>
            </div>
          );
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-2 border-accent pl-4 italic text-sm text-ink-2">
              {line.slice(2)}
            </blockquote>
          );
        }
        if (line.startsWith("---") || line.startsWith("***")) {
          return <hr key={i} className="border-line my-4" />;
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        return (
          <p key={i} className="text-sm text-ink-2 leading-relaxed">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-medium text-ink">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="font-mono text-xs bg-paper-2 px-1 py-0.5 rounded text-accent">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
}

function GenerateView({ projectId }: { projectId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const deliverableType = searchParams.get("type") as DeliverableType;

  const [content, setContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingDone, setRatingDone] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("spos_last_content");
    if (stored) {
      setContent(stored);
      sessionStorage.removeItem("spos_last_content");
      sessionStorage.removeItem("spos_last_type");
    }
  }, []);

  async function handleCopy() {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deliverableType ?? "asset"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!content) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
          <p className="text-sm text-ink-2">Loading result...</p>
          <p className="text-xs text-ink-3 mt-1">
            If this persists,{" "}
            <button
              onClick={() => router.push(`/dashboard/project/${projectId}`)}
              className="text-accent underline"
            >
              go back and try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/project/${projectId}`}
            className="flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to project
          </Link>
          <span className="text-ink-3">/</span>
          <span className="text-xs font-mono text-ink-2 capitalize">
            {deliverableType?.replace(/_/g, " ")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors"
          >
            {copied ? (
              <><CheckCircle className="w-3.5 h-3.5 text-teal" /> Copied</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Copy</>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs hover:bg-accent-hover transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download .md
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-paper border border-line rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-line flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-teal" />
              <span className="text-sm font-medium capitalize">
                {deliverableType?.replace(/_/g, " ")}
              </span>
              <span className="ml-auto text-xs font-mono text-teal">Generated ✓</span>
            </div>
            <div className="px-6 py-5 overflow-auto max-h-[640px]">
              <div className="prose prose-sm max-w-none text-ink-2
                prose-headings:font-display prose-headings:font-semibold prose-headings:text-ink
                prose-h1:text-xl prose-h2:text-base prose-h3:text-sm
                prose-p:text-sm prose-p:leading-relaxed prose-p:text-ink-2
                prose-strong:text-ink prose-strong:font-medium
                prose-ul:text-sm prose-li:text-ink-2
                prose-blockquote:text-ink-2 prose-blockquote:border-accent">
                <MarkdownContent content={content} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-paper border border-line rounded-xl p-4">
            <p className="text-xs font-mono text-ink-3 mb-3">STATUS</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal" />
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>

          <div className="bg-paper border border-line rounded-xl p-4">
            <p className="text-xs font-mono text-ink-3 mb-3">RATE THIS OUTPUT</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => { setRating(star); setRatingDone(true); }}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-5 h-5 ${star <= rating ? "fill-current text-amber" : "text-ink-3"}`} />
                </button>
              ))}
            </div>
            {ratingDone && (
              <p className="text-xs text-teal mt-2">Thanks for the feedback!</p>
            )}
          </div>

          <div className="bg-paper-2 rounded-xl p-4">
            <p className="text-xs font-mono text-ink-3 mb-3">NEXT STEPS</p>
            <div className="space-y-2 text-xs text-ink-2">
              <p>→ Copy to Notion or Google Docs</p>
              <p>→ Share with your co-founder</p>
              <p>→ Generate MVP plan or market analysis</p>
              <p>→ Use with Claude for more depth</p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/dashboard/project/${projectId}`)}
            className="w-full text-xs text-center text-ink-3 hover:text-ink border border-line rounded-lg py-2.5 hover:bg-paper-2 transition-colors"
          >
            Generate another asset
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-full flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
        </div>
      }
    >
      <GenerateView projectId={id} />
    </Suspense>
  );
}
