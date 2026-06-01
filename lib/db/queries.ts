import { createClient } from "@/lib/supabase/server";
import type {
  Project,
  Idea,
  GeneratedAsset,
  GenerationJob,
  StartupDNA,
  DeliverableType,
} from "@/types";

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProject(
  projectId: string,
  userId: string
): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function createProject(
  userId: string,
  title: string
): Promise<Project> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: userId, title, status: "active" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProjectDNA(
  projectId: string,
  dna: StartupDNA
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ startup_dna: dna, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) throw error;
}

// ─── Ideas ───────────────────────────────────────────────────────────────────

export async function createIdea(
  projectId: string,
  rawText: string
): Promise<Idea> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .insert({ project_id: projectId, raw_text: rawText })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIdeaDNA(
  ideaId: string,
  dna: StartupDNA
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ideas")
    .update({ parsed_dna: dna })
    .eq("id", ideaId);

  if (error) throw error;
}

export async function getProjectIdeas(projectId: string): Promise<Idea[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Generated Assets ─────────────────────────────────────────────────────────

export async function getProjectAssets(
  projectId: string
): Promise<GeneratedAsset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generated_assets")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createAsset(params: {
  projectId: string;
  templateId: string;
  deliverableType: DeliverableType;
  content: string;
  modelUsed: string;
  tokensUsed: number;
  generationTimeMs: number;
}): Promise<GeneratedAsset> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generated_assets")
    .insert({
      project_id: params.projectId,
      template_id: params.templateId,
      deliverable_type: params.deliverableType,
      content: params.content,
      model_used: params.modelUsed,
      tokens_used: params.tokensUsed,
      generation_time_ms: params.generationTimeMs,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAssetQualityScore(
  assetId: string,
  score: number
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("generated_assets")
    .update({ quality_score: score })
    .eq("id", assetId);

  if (error) throw error;
}

// ─── Generation Jobs ──────────────────────────────────────────────────────────

export async function createGenerationJob(
  projectId: string,
  assetType: DeliverableType
): Promise<GenerationJob> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generation_jobs")
    .insert({
      project_id: projectId,
      asset_type: assetType,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateJobStatus(
  jobId: string,
  status: GenerationJob["status"],
  assetId?: string,
  errorMessage?: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("generation_jobs")
    .update({
      status,
      asset_id: assetId ?? null,
      error_message: errorMessage ?? null,
      completed_at:
        status === "complete" || status === "failed"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", jobId);

  if (error) throw error;
}

export async function getActiveJob(
  projectId: string
): Promise<GenerationJob | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("project_id", projectId)
    .in("status", ["pending", "running"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}
