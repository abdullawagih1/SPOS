import { task } from "@trigger.dev/sdk/v3";
import { generateAsset } from "@/lib/ai/prompt-composer";
import { evaluateQuality } from "@/lib/ai/quality-evaluator";
import { createAsset, updateAssetQualityScore, updateJobStatus } from "@/lib/db/queries";
import type { DeliverableType, StartupDNA } from "@/types";

export interface GenerateAssetPayload {
  jobId: string;
  projectId: string;
  deliverableType: DeliverableType;
  dna: StartupDNA;
}

export const generateAssetTask = task({
  id: "generate-asset",
  maxDuration: 300, // 5 minutes max

  run: async (payload: GenerateAssetPayload) => {
    const { jobId, projectId, deliverableType, dna } = payload;
    const startTime = Date.now();

    try {
      // Mark job as running
      await updateJobStatus(jobId, "running");

      // Generate the asset
      const { content, templateId, tokensUsed } = await generateAsset(
        dna,
        deliverableType
      );

      const generationTimeMs = Date.now() - startTime;

      // Save asset to DB
      const asset = await createAsset({
        projectId,
        templateId,
        deliverableType,
        content,
        modelUsed: "claude-sonnet-4-5",
        tokensUsed,
        generationTimeMs,
      });

      // Mark job as complete
      await updateJobStatus(jobId, "complete", asset.id);

      // Async quality evaluation (non-blocking)
      evaluateQuality(content, deliverableType, dna.industry, dna.stage)
        .then((scores) => updateAssetQualityScore(asset.id, scores.overall))
        .catch((err) => console.error("[quality-eval] Failed:", err));

      return {
        success: true,
        assetId: asset.id,
        tokensUsed,
        generationTimeMs,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await updateJobStatus(jobId, "failed", undefined, errorMessage);

      throw error; // Re-throw so Trigger.dev can handle retries
    }
  },

  // Retry config
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 10000,
  },
});
