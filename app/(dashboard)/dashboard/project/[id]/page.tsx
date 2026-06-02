"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DNACard } from "@/components/dna-card";
import { DeliverableSelector } from "@/components/deliverable-selector";
import { AssetCard } from "@/components/asset-card";
import { Loader2 } from "lucide-react";
import type { Project, GeneratedAsset } from "@/types";

const ASSET_ORDER: Record<string, number> = {
  investor_narrative: 1,
  market_analysis: 2,
  mvp_plan: 3,
  product_requirements: 4,
  architecture_overview: 5,
  agent_system_design: 6,
};

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: proj }, { data: assetData }] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).eq("user_id", user.id).single(),
        supabase.from("generated_assets").select("*").eq("project_id", id),
      ]);

      if (!proj) { router.push("/dashboard"); return; }

      setProject(proj);
      setAssets(assetData ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  function handleAssetDeleted(assetId: string) {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  }

  const sorted = [...assets].sort((a, b) => {
    const oa = ASSET_ORDER[a.deliverable_type] ?? 99;
    const ob = ASSET_ORDER[b.deliverable_type] ?? 99;
    return oa !== ob ? oa - ob
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[1.5px] text-ink-3 mb-1">PROJECT</p>
        <h1 className="font-display font-bold text-2xl text-ink leading-tight">
          {project.title}
        </h1>
      </div>

      {project.startup_dna && (
        <div className="mb-8">
          <DNACard dna={project.startup_dna} />
        </div>
      )}

      <div className="mb-10">
        <h2 className="font-display font-semibold text-base mb-4">
          Generate startup assets
        </h2>
        <DeliverableSelector
          projectId={project.id}
          dna={project.startup_dna}
          userPlan="free"
          existingAssets={sorted}
        />
      </div>

      {sorted.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-base mb-4">
            Your assets
            <span className="ml-2 text-xs font-mono font-normal text-ink-3">
              ({sorted.length})
            </span>
          </h2>
          <div className="space-y-3">
            {sorted.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onDelete={handleAssetDeleted}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
