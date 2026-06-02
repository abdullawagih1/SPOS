"use client";

import { useState } from "react";
import { Copy, Download, CheckCircle, ChevronDown, ChevronUp, Clock, Share2, RefreshCw, AlertCircle } from "lucide-react";
import type { GeneratedAsset, DeliverableType } from "@/types";

// ─── Asset metadata ────────────────────────────────────────────────────────────

const ASSET_META: Record<DeliverableType, { description: string; order: number }> = {
  investor_narrative: {
    description: "Problem, insight, solution, market opportunity, business model, team, and funding ask.",
    order: 1,
  },
  market_analysis: {
    description: "Bottom-up TAM/SAM/SOM, competitive landscape, customer segmentation, and GTM strategy.",
    order: 2,
  },
  mvp_plan: {
    description: "Feature prioritization, must-have vs won't-have, 12-week sprint plan, and pivot triggers.",
    order: 3,
  },
  product_requirements: {
    description: "Full PRD with user stories, binary acceptance criteria, edge cases, and launch checklist.",
    order: 4,
  },
  architecture_overview: {
    description: "Tech stack, system diagram, database schema, HIPAA compliance layer, and infrastructure costs.",
    order: 5,
  },
  agent_system_design: {
    description: "Multi-agent roles, orchestration logic, clinical guardrails, and LangGraph implementation.",
    order: 6,
  },
};

// ─── Smart status ──────────────────────────────────────────────────────────────

type AssetStatus = "ready" | "exported" | "needs_review";

function getStatus(asset: GeneratedAsset): AssetStatus {
  if (asset.quality_score !== null && asset.quality_score < 7) return "needs_review";
  // Could track exports in future — for now default to "ready"
  return "ready";
}

const STATUS_CONFIG: Record<AssetStatus, { label: string; icon: React.ReactNode; className: string }> = {
  ready: {
    label: "Ready",
    icon: <CheckCircle className="w-3 h-3" />,
    className: "bg-[#EAF3DE] text-[#3B6D11]",
  },
  exported: {
    label: "Exported",
    icon: <Share2 className="w-3 h-3" />,
    className: "bg-accent-light text-accent",
  },
  needs_review: {
    label: "Needs review",
    icon: <AlertCircle className="w-3 h-3" />,
    className: "bg-amber-light text-amber",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

interface AssetCardProps {
  asset: GeneratedAsset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = ASSET_META[asset.deliverable_type] ?? {
    description: asset.deliverable_type.replace(/_/g, " "),
    order: 99,
  };

  const status = getStatus(asset);
  const statusConfig = STATUS_CONFIG[status];

  const deliverableLabel = asset.deliverable_type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const createdAt = new Date(asset.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  return (
    <div className="bg-paper border border-line rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-sm font-medium text-ink">{deliverableLabel}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig.className}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-ink-2 leading-relaxed mb-2">
            {meta.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] font-mono text-ink-3">
              <Clock className="w-3 h-3" />
              {createdAt}
            </span>
            <span className="text-[10px] font-mono text-ink-3">
              {asset.tokens_used.toLocaleString()} tokens
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
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
            className="inline-flex items-center gap-1 px-2 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors"
            aria-label="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-2 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-line px-5 py-4">
          <div className="text-xs text-ink-2 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {asset.content}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sorted asset list ─────────────────────────────────────────────────────────

export function sortAssets(assets: GeneratedAsset[]): GeneratedAsset[] {
  return [...assets].sort((a, b) => {
    const orderA = ASSET_META[a.deliverable_type]?.order ?? 99;
    const orderB = ASSET_META[b.deliverable_type]?.order ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    // Same type — most recent first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
