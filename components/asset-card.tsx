"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Download, CheckCircle, ChevronDown, ChevronUp, Star } from "lucide-react";
import type { GeneratedAsset } from "@/types";

interface AssetCardProps {
  asset: GeneratedAsset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const deliverableLabel = asset.deliverable_type.replace(/_/g, " ");
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

  const qualityColor =
    !asset.quality_score ? "text-ink-3" :
    asset.quality_score >= 8 ? "text-teal" :
    asset.quality_score >= 6 ? "text-amber" :
    "text-coral";

  return (
    <div className="bg-paper border border-line rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-teal flex-shrink-0" />
          <div>
            <span className="text-sm font-medium capitalize">{deliverableLabel}</span>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] font-mono text-ink-3">{createdAt}</span>
              <span className="text-[10px] font-mono text-ink-3">
                {asset.tokens_used.toLocaleString()} tokens
              </span>
            </div>
          </div>
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
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Content preview / expanded */}
      {expanded ? (
        <div className="border-t border-line px-5 py-4">
          <div
            className="text-xs text-ink-2 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {asset.content}
          </div>
        </div>
      ) : (
        <div
          className="px-5 pb-4 text-xs text-ink-3 line-clamp-2 cursor-pointer hover:text-ink-2 transition-colors"
          onClick={() => setExpanded(true)}
        >
          {asset.content.slice(0, 200)}...
        </div>
      )}
    </div>
  );
}
