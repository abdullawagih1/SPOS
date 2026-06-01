import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProject, getProjectAssets } from "@/lib/db/queries";
import { DNACard } from "@/components/dna-card";
import { DeliverableSelector } from "@/components/deliverable-selector";
import { AssetCard } from "@/components/asset-card";
import type { GeneratedAsset } from "@/types";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) notFound();

  const [project, assets] = await Promise.all([
    getProject(id, user.id),
    getProjectAssets(id),
  ]);

  if (!project) notFound();

  return (
    <div className="p-8 max-w-5xl">
      {/* Project header */}
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[1.5px] text-ink-3 mb-1">
          PROJECT
        </p>
        <h1 className="font-display font-bold text-2xl text-ink leading-tight">
          {project.title}
        </h1>
      </div>

      {/* DNA Card */}
      {project.startup_dna && (
        <div className="mb-8">
          <DNACard dna={project.startup_dna} />
        </div>
      )}

      {/* Deliverable Selector */}
      <div className="mb-10">
        <h2 className="font-display font-semibold text-base mb-4">
          Generate startup assets
        </h2>
        <DeliverableSelector
          projectId={project.id}
          dna={project.startup_dna}
          userPlan="free"
        />
      </div>

      {/* Generated Assets */}
      {assets.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-base mb-4">
            Your assets
            <span className="ml-2 text-xs font-mono font-normal text-ink-3">
              ({assets.length})
            </span>
          </h2>
          <div className="space-y-3">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
