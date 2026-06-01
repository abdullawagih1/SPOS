"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Copy, Download, CheckCircle, ArrowLeft, Star } from "lucide-react";
import type { GenerationJob, GeneratedAsset, DeliverableType } from "@/types";

function GenerateView({ projectId }: { projectId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const jobId = searchParams.get("job_id");
  const deliverableType = searchParams.get("type") as DeliverableType;

  const [job, setJob] = useState<GenerationJob | null>(null);
  const [asset, setAsset] = useState<GeneratedAsset | null>(null);
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      const { data } = await supabase
        .from("generation_jobs")
        .select("*")
        .eq("id", jobId)
        .single();
      if (data) setJob(data);
    };
    fetchJob();

    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "generation_jobs",
          filter: `id=eq.${jobId}`,
        },
        async (payload) => {
          const updated = payload.new as GenerationJob;
          setJob(updated);
          if (updated.status === "complete" && updated.asset_id) {
            const { data: assetData } = await supabase
              .from("generated_assets")
              .select("*")
              .eq("id", updated.asset_id)
              .single();
            if (assetData) setAsset(assetData);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [jobId]);

  async function handleCopy() {
    if (!asset?.content) return;
    await navigator.clipboard.writeText(asset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!asset?.content) return;
    const blob = new Blob([asset.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deliverableType ?? "asset"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRating(score: number) {
    setRating(score);
    if (asset) {
      await supabase.from("feedback").insert({ asset_id: asset.id, rating: score });
    }
  }

  const isRunning = !job || job.status === "pending" || job.status === "running";
  const isFailed = job?.status === "failed";
  const isComplete = job?.status === "complete";

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
          <span className="text-xs font-mono text-ink-2">
            {deliverableType?.replace(/_/g, " ")}
          </span>
        </div>

        {isComplete && asset && (
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
        )}
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {isRunning && (
            <div className="bg-paper border border-line rounded-xl p-8 min-h-96 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-4">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
              </div>
              <h3 className="font-display font-semibold text-base mb-2">
                Generating {deliverableType?.replace(/_/g, " ")}
              </h3>
              <p className="text-sm text-ink-2 max-w-xs">
                Your expert team is building this asset. Usually takes 30–60 seconds.
              </p>
              <div className="mt-8 space-y-2 w-full max-w-xs text-left">
                {["Activating expert team", "Assembling domain context", "Composing 4-layer prompt", "Generating content", "Running quality check"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                    <span className="text-xs text-ink-2">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isFailed && (
            <div className="bg-paper border border-[#F09595] rounded-xl p-8 text-center">
              <p className="text-sm text-[#791F1F] mb-4">
                Generation failed: {job.error_message ?? "Unknown error"}
              </p>
              <button onClick={() => router.push(`/dashboard/project/${projectId}`)} className="text-sm text-accent hover:underline">
                Try again
              </button>
            </div>
          )}

          {isComplete && asset && (
            <div className="bg-paper border border-line rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-teal" />
                  <span className="text-sm font-medium capitalize">{deliverableType?.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center gap-3">
                  {asset.quality_score && (
                    <span className="text-xs font-mono text-ink-3">Quality: {asset.quality_score.toFixed(1)}/10</span>
                  )}
                  <span className="text-xs font-mono text-ink-3">{asset.tokens_used.toLocaleString()} tokens</span>
                </div>
              </div>
              <div className="px-6 py-5 text-sm text-ink-2 leading-relaxed overflow-auto max-h-[600px] whitespace-pre-wrap">
                {asset.content}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-paper border border-line rounded-xl p-4">
            <p className="text-xs font-mono text-ink-3 mb-3">STATUS</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-amber animate-pulse" : isFailed ? "bg-coral" : "bg-teal"}`} />
              <span className="text-sm font-medium capitalize">{job?.status ?? "pending"}</span>
            </div>
          </div>

          {isComplete && (
            <div className="bg-paper border border-line rounded-xl p-4">
              <p className="text-xs font-mono text-ink-3 mb-3">RATE THIS OUTPUT</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => handleRating(star)} className="transition-transform hover:scale-110">
                    <Star className={`w-5 h-5 ${star <= rating ? "fill-amber text-amber" : "text-ink-3"}`} />
                  </button>
                ))}
              </div>
              {rating > 0 && <p className="text-xs text-teal mt-2">Thanks for the feedback!</p>}
            </div>
          )}

          <div className="bg-paper-2 rounded-xl p-4">
            <p className="text-xs font-mono text-ink-3 mb-3">NEXT STEPS</p>
            <div className="space-y-2 text-xs text-ink-2">
              <p>→ Copy to Notion or Google Docs</p>
              <p>→ Share with your co-founder</p>
              <p>→ Generate MVP plan or market analysis</p>
              <p>→ Use with Claude for more depth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function GeneratePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
