"use client";

import { useState, useRef } from "react";
import {
  Copy, Download, CheckCircle, ChevronDown, ChevronUp,
  Clock, AlertCircle, Trash2, Loader2, Maximize2, Code2, RefreshCw, Play
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GeneratedAsset, DeliverableType } from "@/types";

// ─── Asset metadata ──────────────────────────────────────────────────────────

const ASSET_META: Record<DeliverableType, { description: string; order: number }> = {
  investor_narrative:       { description: "Problem, insight, solution, market opportunity, business model, team, and funding ask.", order: 1 },
  market_analysis:          { description: "Bottom-up TAM/SAM/SOM, competitive landscape, customer segmentation, and GTM strategy.", order: 2 },
  business_model_economics: { description: "Revenue streams, pricing strategy, CAC/LTV, gross margin, break-even, and monetization risks.", order: 3 },
  mvp_plan:                 { description: "Feature prioritization, must-have vs won't-have, 12-week sprint plan, and pivot triggers.", order: 4 },
  product_requirements:     { description: "Full PRD with user stories, binary acceptance criteria, edge cases, and launch checklist.", order: 5 },
  architecture_overview:    { description: "Tech stack, system diagram, database schema, HIPAA compliance layer, and infrastructure costs.", order: 6 },
  agent_system_design:      { description: "Multi-agent roles, orchestration logic, clinical guardrails, and LangGraph implementation.", order: 7 },
  interactive_simulation:   { description: "Live interactive prototype with screens, workflow, and sample data. Ready to demo.", order: 8 },
};

const ASSET_LABELS: Record<string, string> = {
  investor_narrative:       "Investor Narrative",
  market_analysis:          "Market Analysis",
  business_model_economics: "Business Model & Unit Economics",
  mvp_plan:                 "MVP Plan",
  product_requirements:     "Product Requirements",
  architecture_overview:    "Architecture Overview",
  agent_system_design:      "Agent System Design",
  interactive_simulation:   "Interactive Simulation",
};

type AssetStatus = "ready" | "needs_review";

function getStatus(asset: GeneratedAsset): AssetStatus {
  if (asset.quality_score !== null && asset.quality_score < 7) return "needs_review";
  return "ready";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanHtml(raw: string): string {
  return raw
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function isRTL(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text.slice(0, 200));
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

// ─── Interactive Simulation Viewer ────────────────────────────────────────────

function InteractiveSimulationViewer({
  asset,
  onDelete,
}: {
  asset: GeneratedAsset;
  onDelete?: (id: string) => void;
}) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const supabaseRef = useRef(createClient());

  const html = cleanHtml(asset.content);

  const createdAt = new Date(asset.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  function handleDownload() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interactive-simulation.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFullscreen() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  async function handleCopyCode() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }
    onDelete?.(asset.id);
  }

  return (
    <div className="bg-paper border border-line rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-line">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-sm font-medium text-ink">Interactive Simulation</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-light text-accent border border-accent-border">
                <Play className="w-2.5 h-2.5" /> Live preview
              </span>
            </div>
            <p className="text-xs text-ink-2 mb-2">
              Live interactive prototype with screens, workflow, and sample data. Ready to demo.
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] font-mono text-ink-3">
                <Clock className="w-3 h-3" />{createdAt}
              </span>
              <span className="text-[10px] font-mono text-ink-3">
                {asset.tokens_used.toLocaleString()} tokens
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            <button
              onClick={handleFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Open fullscreen
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download HTML
            </button>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors"
            >
              {copied
                ? <><CheckCircle className="w-3.5 h-3.5 text-teal" /> Copied</>
                : <><Copy className="w-3.5 h-3.5" /> Copy code</>
              }
            </button>
            <button
              onClick={() => setShowCode(!showCode)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs transition-colors ${showCode ? "bg-paper-2 border-line" : "border-line hover:bg-paper-2"}`}
            >
              <Code2 className="w-3.5 h-3.5" />
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
          </div>
        </div>
      </div>

      {/* Code view */}
      {showCode && (
        <div className="border-b border-line bg-paper-2 px-5 py-3 max-h-48 overflow-auto">
          <pre className="text-[10px] font-mono text-ink-3 whitespace-pre-wrap">{html.slice(0, 2000)}...</pre>
        </div>
      )}

      {/* iframe preview */}
      <iframe
        srcDoc={html}
        className="w-full border-0"
        style={{ height: "720px" }}
        sandbox="allow-scripts allow-same-origin"
        title="Interactive simulation preview"
      />
    </div>
  );
}

// ─── Main AssetCard ───────────────────────────────────────────────────────────

interface AssetCardProps {
  asset: GeneratedAsset;
  onDelete?: (id: string) => void;
}

export function AssetCard({ asset, onDelete }: AssetCardProps) {
  // Simulation gets its own full renderer
  if (asset.deliverable_type === "interactive_simulation") {
    return <InteractiveSimulationViewer asset={asset} onDelete={onDelete} />;
  }

  return <DocumentAssetCard asset={asset} onDelete={onDelete} />;
}

// ─── Document Asset Card (markdown-based assets) ──────────────────────────────

function DocumentAssetCard({ asset, onDelete }: AssetCardProps) {
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
    const blob = new Blob([asset.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${asset.deliverable_type}.md`;
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
          <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1 px-2 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-line px-5 py-4">
          <div className="max-h-96 overflow-y-auto">
            <MarkdownContent content={asset.content} />
          </div>
        </div>
      )}
    </div>
  );
}
