"use client";

import { useState, useRef } from "react";
import { Copy, Download, CheckCircle, ChevronDown, ChevronUp, Clock, AlertCircle, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GeneratedAsset, DeliverableType } from "@/types";

const ASSET_META: Record<DeliverableType, { description: string; order: number }> = {
  investor_narrative: { description: "Problem, insight, solution, market opportunity, business model, team, and funding ask.", order: 1 },
  market_analysis: { description: "Bottom-up TAM/SAM/SOM, competitive landscape, customer segmentation, and GTM strategy.", order: 2 },
  mvp_plan: { description: "Feature prioritization, must-have vs won't-have, 12-week sprint plan, and pivot triggers.", order: 3 },
  product_requirements: { description: "Full PRD with user stories, binary acceptance criteria, edge cases, and launch checklist.", order: 4 },
  architecture_overview: { description: "Tech stack, system diagram, database schema, HIPAA compliance layer, and infrastructure costs.", order: 5 },
  agent_system_design: { description: "Multi-agent roles, orchestration logic, clinical guardrails, and LangGraph implementation.", order: 6 },
  interactive_simulation: { description: "Live HTML demo with dashboard, agent workflow, and realistic sample data. Open in browser and show investors.", order: 7 },
};

const ASSET_LABELS: Record<string, string> = {
  investor_narrative: "Investor Narrative",
  market_analysis: "Market Analysis",
  mvp_plan: "MVP Plan",
  product_requirements: "Product Requirements",
  architecture_overview: "Architecture Overview",
  agent_system_design: "Agent System Design",
  interactive_simulation: "Interactive Simulation",
};

type AssetStatus = "ready" | "needs_review";

function getStatus(asset: GeneratedAsset): AssetStatus {
  if (asset.quality_score !== null && asset.quality_score < 7) return "needs_review";
  return "ready";
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="font-medium text-ink">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={i}>{part.slice(1, -1)}</em>;
        if (part.startsWith("`") && part.endsWith("`"))
          return <code key={i} className="font-mono text-[10px] bg-paper-2 px-1 py-0.5 rounded text-accent">{part.slice(1, -1)}</code>;
        return part;
      })}
    </>
  );
}

function isRTL(text: string): boolean {
  const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u0590-\u05FF]/;
  return rtlChars.test(text.slice(0, 200));
}

function MarkdownContent({ content }: { content: string }) {
  const rtl = isRTL(content);
  return (
    <div className="space-y-2.5" dir={rtl ? "rtl" : "ltr"}>
      {content.split("\n").map((line, i) => {
        if (line.startsWith("# "))
          return <h1 key={i} className="font-display font-bold text-base text-ink mt-4 mb-1">{line.slice(2)}</h1>;
        if (line.startsWith("## "))
          return <h2 key={i} className="font-display font-semibold text-sm text-ink mt-4 mb-1 pb-1 border-b border-line">{line.slice(3)}</h2>;
        if (line.startsWith("### "))
          return <h3 key={i} className="font-display font-semibold text-xs text-ink mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("- ") || line.startsWith("* "))
          return (
            <div key={i} className="flex items-start gap-2 text-xs text-ink-2 leading-relaxed">
              <span className="text-accent mt-0.5 flex-shrink-0">→</span>
              <span>{formatInline(line.slice(2))}</span>
            </div>
          );
        if (line.match(/^\d+\. /)) {
          const num = line.match(/^(\d+)\./)?.[1];
          return (
            <div key={i} className="flex items-start gap-2.5 text-xs text-ink-2 leading-relaxed">
              <span className="font-mono text-[10px] text-ink-3 bg-paper-2 rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">{num}</span>
              <span>{formatInline(line.replace(/^\d+\. /, ""))}</span>
            </div>
          );
        }
        if (line.startsWith("> "))
          return <blockquote key={i} className="border-l-2 border-accent pl-3 italic text-xs text-ink-2">{line.slice(2)}</blockquote>;
        if (line.startsWith("---"))
          return <hr key={i} className="border-line my-2" />;
        if (line.trim() === "")
          return <div key={i} className="h-1" />;
        return <p key={i} className="text-xs text-ink-2 leading-relaxed">{formatInline(line)}</p>;
      })}
    </div>
  );
}

interface AssetCardProps {
  asset: GeneratedAsset;
  onDelete?: (id: string) => void;
}

export function AssetCard({ asset, onDelete }: AssetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const supabaseRef = useRef(createClient());

  const meta = ASSET_META[asset.deliverable_type] ?? { description: "", order: 99 };
  const status = getStatus(asset);
  const label = ASSET_LABELS[asset.deliverable_type] ?? asset.deliverable_type.replace(/_/g, " ");

  const createdAt = new Date(asset.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  async function handleCopy() {
    await navigator.clipboard.writeText(asset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const isSimulation = asset.deliverable_type === "interactive_simulation";
    const mimeType = isSimulation ? "text/html" : "text/plain";
    const extension = isSimulation ? "html" : "md";
    const blob = new Blob([asset.content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${asset.deliverable_type}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    const { error } = await supabaseRef.current
      .from("generated_assets")
      .delete()
      .eq("id", asset.id);
    if (error) {
      console.error("Delete error:", error.message);
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }
    onDelete?.(asset.id);
  }

  return (
    <div className="bg-paper border border-line rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-sm font-medium text-ink">{label}</span>
            {status === "ready" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11]">
                <CheckCircle className="w-3 h-3" /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-light text-amber">
                <AlertCircle className="w-3 h-3" /> Needs review
              </span>
            )}
          </div>
          <p className="text-xs text-ink-2 leading-relaxed mb-2">{meta.description}</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] font-mono text-ink-3">
              <Clock className="w-3 h-3" />{createdAt}
            </span>
            <span className="text-[10px] font-mono text-ink-3">
              {asset.tokens_used.toLocaleString()} tokens
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors">
            {copied ? <><CheckCircle className="w-3.5 h-3.5 text-teal" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
          <button onClick={handleDownload} className="inline-flex items-center gap-1 px-2 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors" aria-label="Download">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={deleting}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs transition-colors disabled:opacity-50 ${
              confirmDelete
                ? "bg-[#FCEBEB] text-[#791F1F] border-[#F09595] font-medium"
                : "border-line hover:bg-[#FCEBEB] hover:text-[#791F1F] hover:border-[#F09595]"
            }`}
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : confirmDelete ? <><Trash2 className="w-3.5 h-3.5" /> Confirm</> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1 px-2 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors" aria-label={expanded ? "Collapse" : "Expand"}>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-line px-5 py-4">
          {asset.deliverable_type === "interactive_simulation" ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-ink-3 font-mono">LIVE PREVIEW</span>
                <a
                  href={URL.createObjectURL(new Blob([asset.content], { type: "text/html" }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                  onClick={(e) => {
                    const blob = new Blob([asset.content], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    (e.currentTarget as HTMLAnchorElement).href = url;
                  }}
                >
                  Open in new tab ↗
                </a>
              </div>
              <iframe
                srcDoc={asset.content}
                className="w-full h-96 border border-line rounded-lg"
                sandbox="allow-scripts allow-same-origin"
                title="Simulation preview"
              />
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <MarkdownContent content={asset.content} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
