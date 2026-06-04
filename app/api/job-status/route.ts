import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("job_id");
  if (!jobId) return NextResponse.json({ error: "Missing job_id" }, { status: 400 });

  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("generation_jobs")
    .select("id, status, asset_id, error_message")
    .eq("id", jobId)
    .single();

  if (error || !job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  if (job.status === "complete" && job.asset_id) {
    const { data: asset } = await supabase
      .from("generated_assets")
      .select("content, deliverable_type")
      .eq("id", job.asset_id)
      .single();

    return NextResponse.json({ status: "complete", content: asset?.content, deliverable_type: asset?.deliverable_type });
  }

  if (job.status === "failed") {
    return NextResponse.json({ status: "failed", error: job.error_message });
  }

  return NextResponse.json({ status: job.status });
}
