import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProject, createGenerationJob, updateJobStatus, createAsset } from "@/lib/db/queries";
import { generateAsset } from "@/lib/ai/prompt-composer";
import { evaluateQuality } from "@/lib/ai/quality-evaluator";
import { updateAssetQualityScore } from "@/lib/db/queries";
import { z } from "zod";
import type { DeliverableType } from "@/types";

const bodySchema = z.object({
  project_id: z.string().uuid(),
  deliverable_type: z.enum([
    "investor_narrative",
    "mvp_plan",
    "market_analysis",
    "architecture_overview",
    "agent_system_design",
    "product_requirements",
  ]),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { project_id, deliverable_type } = parsed.data;

    const project = await getProject(project_id, user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.startup_dna) {
      return NextResponse.json({ error: "No DNA found. Analyze your idea first." }, { status: 400 });
    }

    // Create job record
    const job = await createGenerationJob(project_id, deliverable_type);
    await updateJobStatus(job.id, "running");

    const startTime = Date.now();

    // Generate directly — no background worker needed
    const { content, templateId, tokensUsed } = await generateAsset(
      project.startup_dna,
      deliverable_type
    );

    const generationTimeMs = Date.now() - startTime;

    // Save asset
    const asset = await createAsset({
      projectId: project_id,
      templateId,
      deliverableType: deliverable_type,
      content,
      modelUsed: "claude-sonnet-4-5",
      tokensUsed,
      generationTimeMs,
    });

    await updateJobStatus(job.id, "complete", asset.id);

    // Quality eval async (non-blocking)
    evaluateQuality(content, deliverable_type, project.startup_dna.industry, project.startup_dna.stage)
      .then((scores) => updateAssetQualityScore(asset.id, scores.overall))
      .catch((err) => console.error("[quality-eval]", err));

    return NextResponse.json({
      success: true,
      job_id: job.id,
      asset_id: asset.id,
      content,
    });

  } catch (error) {
    console.error("[/api/generate]", error);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
