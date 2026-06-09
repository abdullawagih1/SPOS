import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseIdea } from "@/lib/ai/idea-parser";
import { createIdea, createProject, updateProjectDNA, updateIdeaDNA } from "@/lib/db/queries";
import { z } from "zod";

export const maxDuration = 60;

const bodySchema = z.object({
  raw_text: z.string().min(10, "Idea must be at least 10 characters"),
  project_id: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate body
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { raw_text, project_id } = parsed.data;

    // Create or use existing project
    let finalProjectId = project_id;
    if (!finalProjectId) {
      const project = await createProject(
        user.id,
        raw_text.slice(0, 60) + (raw_text.length > 60 ? "..." : "")
      );
      finalProjectId = project.id;
    }

    // Save raw idea first
    const idea = await createIdea(finalProjectId, raw_text);

    // Parse idea with AI
    const dna = await parseIdea(raw_text);

    // Save DNA to both idea and project
    await Promise.all([
      updateIdeaDNA(idea.id, dna),
      updateProjectDNA(finalProjectId, dna),
    ]);

    return NextResponse.json({
      success: true,
      project_id: finalProjectId,
      idea_id: idea.id,
      dna,
    });
  } catch (error) {
    console.error("[/api/ideas/analyze]", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
