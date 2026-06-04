import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProject, createGenerationJob } from "@/lib/db/queries";
import { tasks } from "@trigger.dev/sdk/v3";
import type { generateAssetTask } from "@/trigger/generate-asset";
import { z } from "zod";
import type { DeliverableType } from "@/types";

const bodySchema = z.object({
  project_id: z.string().uuid(),
  deliverable_type: z.enum([
    "investor_narrative",
    "mvp_plan",
    "market_analysis",
    "business_model_economics",
    "architecture_overview",
    "agent_system_design",
    "product_requirements",
    "interactive_simulation",
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

    // Trigger background task — returns immediately, no timeout risk
    await tasks.trigger<typeof generateAssetTask>("generate-asset", {
      jobId: job.id,
      projectId: project_id,
      deliverableType: deliverable_type,
      dna: project.startup_dna,
    });

    return NextResponse.json({
      success: true,
      job_id: job.id,
    });

  } catch (error) {
    console.error("[/api/generate]", error);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}