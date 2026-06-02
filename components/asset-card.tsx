"use client";

import { useState, useRef } from "react";
import { Copy, Download, CheckCircle, ChevronDown, ChevronUp, Clock, Share2, AlertCircle, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GeneratedAsset, DeliverableType } from "@/types";

const ASSET_META: Record<DeliverableType, { description: string; order: number }> = {
  investor_narrative: { description: "Problem, insight, solution, market opportunity, business model, team, and funding ask.", order: 1 },
  market_analysis: { description: "Bottom-up TAM/SAM/SOM, competitive landscape, customer segmentation, and GTM strategy.", order: 2 },
  mvp_plan: { description: "Feature prioritization, must-have vs won't-have, 12-week sprint plan, and pivot triggers.", order: 3 },
  product_requirements: { description: "Full PRD with user stories, binary acceptance criteria, edge cases, and launch checklist.", order: 4 },
  architecture_overview: { description: "Tech stack, system diagram, database schema, HIPAA compliance layer, and infrastructure costs.", order: 5 },
  agent_system_design: { description: "Multi-agent roles, orchestration logic, clinical guardrails, and LangGraph implementation.", order: 6 },
};

const ASSET_LABELS: Record<string, string> = {
  investor_narrative: "Investor Narrative",
  market_analysis: "Market Analysis",
  mvp_plan: "MVP Plan",
  product_requirements: "Product Requirements",
  architecture_overview: "Architecture Overview",
  agent_system_design: "Agent System Design",
};

type AssetStatus = "ready" | "needs_review";

function getStatus(asset: GeneratedAsset): AssetStatus {
  if (asset.quality_score !== null && asset.quality_score < 7) return "needs_review";
  return "ready";
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
          <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1 px-2 py-1.5 border border-line rounded-lg text-xs hover:bg-paper-2 transition-colors" aria-label={expanded ? "Collapse" : "Expand"}>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

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
