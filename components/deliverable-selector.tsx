"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Clock, Zap, CheckCircle, RefreshCw, Download } from "lucide-react";
import { DELIVERABLE_CONFIGS } from "@/types";
import type { StartupDNA, Plan, DeliverableType, GeneratedAsset } from "@/types";

interface DeliverableSelectorProps {
  projectId: string;
  dna: StartupDNA | null;
  userPlan: Plan;
  existingAssets?: GeneratedAsset[];
}

export function DeliverableSelector({
  projectId,
  dna,
  userPlan,
  existingAssets = [],
}: DeliverableSelectorProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState<DeliverableType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Build a set of already-generated deliverable types
  const generatedTypes = new Set(existingAssets.map((a) => a.deliverable_type));

  async function handleGenerate(deliverableType: DeliverableType) {
    if (!dna || generating) return;
    setGenerating(deliverableType);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, deliverable_type: deliverableType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate. Please try again.");
        setGenerating(null);
        return;
      }

      sessionStorage.setItem("spos_last_content", data.content);
      sessionStorage.setItem("spos_last_type", deliverableType);
      router.push(`/dashboard/project/${projectId}/generate?type=${deliverableType}`);
    } catch {
      setError("Network error. Please try again.");
      setGenerating(null);
    }
  }

  async function handleDownloadAll() {
    if (existingAssets.length === 0) return;

    // Download each asset as a separate file with a small delay
    for (const asset of existingAssets) {
      const label = asset.deliverable_type.replace(/_/g, "-");
      const blob = new Blob([asset.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SPOS-${label}.md`;
      a.click();
      URL.revokeObjectURL(url);
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  if (!dna) {
    return (
      <p className="text-sm text-ink-3 text-center py-8">
        Analyze an idea first to unlock asset generation.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-[#FCEBEB] border border-[#F09595] rounded-lg px-4 py-3 text-sm text-[#791F1F] mb-4">
          {error}
        </div>
      )}

      {generating && (
        <div className="mb-4 bg-accent-light border border-accent-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-4 h-4 text-accent animate-spin" />
            <span className="text-sm font-medium text-ink">
              Generating {generating.replace(/_/g, " ")}...
            </span>
          </div>
          <div className="space-y-1.5">
            {["Activating expert team", "Composing 4-layer prompt", "Generating with Claude", "Running quality check"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                <span className="text-xs text-ink-2">{step}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-3 mt-3">This takes 30–60 seconds — please wait</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {DELIVERABLE_CONFIGS.map((config) => {
          const isLocked = !config.available_on.includes(userPlan);
          const isGenerating = generating === config.type;
          const isDisabled = !!generating || isLocked;
          const isGenerated = generatedTypes.has(config.type);

          return (
            <button
              key={config.type}
              onClick={() => !isDisabled && handleGenerate(config.type)}
              disabled={isDisabled}
              className={`
                relative text-left border rounded-xl p-4 transition-all
                ${isLocked
                  ? "border-line opacity-40 cursor-not-allowed"
                  : isGenerating
                  ? "border-accent bg-accent-light cursor-wait"
                  : generating
                  ? "border-line opacity-50 cursor-not-allowed"
                  : isGenerated
                  ? "border-[#A0D9CE] bg-[#F0FBF8] hover:border-teal hover:bg-[#E3F5F1] cursor-pointer"
                  : "border-line hover:border-accent/50 hover:bg-accent-light/20 cursor-pointer"
                }
              `}
            >
              {isLocked && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-3.5 h-3.5 text-ink-3" />
                </div>
              )}

              {isGenerated && !isLocked && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-3.5 h-3.5 text-teal" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                ) : isGenerated ? (
                  <RefreshCw className="w-4 h-4 text-teal" />
                ) : (
                  <Zap className={`w-4 h-4 ${isLocked ? "text-ink-3" : "text-accent"}`} />
                )}
                <span className={`text-sm font-medium ${isGenerating ? "text-accent" : isGenerated ? "text-teal" : "text-ink"}`}>
                  {config.label}
                </span>
              </div>

              <p className="text-xs text-ink-2 leading-relaxed mb-3">
                {config.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-ink-3">
                    <Clock className="w-3 h-3" />
                    ~{config.estimated_minutes}min
                  </span>
                  <span className="text-[10px] font-mono text-ink-3">
                    {config.credit_cost} credits
                  </span>
                </div>
                {isGenerated && !isGenerating && (
                  <span className="text-[10px] font-mono text-teal font-medium">
                    Generated ↺
                  </span>
                )}
              </div>

              {isLocked && (
                <p className="mt-2 text-[10px] font-mono text-ink-3">Pro+ required</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Download all button */}
      {existingAssets.length > 0 && (
        <div className="mt-5 pt-5 border-t border-line flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Startup package</p>
            <p className="text-xs text-ink-3 mt-0.5">
              {existingAssets.length} asset{existingAssets.length !== 1 ? "s" : ""} ready to download
            </p>
          </div>
          <button
            onClick={handleDownloadAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-ink-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download all
          </button>
        </div>
      )}
    </div>
  );
}
