import Anthropic from "@anthropic-ai/sdk";
import type { DeliverableType } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EVALUATOR_PROMPT = `You are a senior startup advisor evaluating AI-generated startup content for quality.

Score the content on these 5 dimensions (1-10 each):
1. domain_accuracy: Does it show genuine domain expertise? Are facts accurate?
2. completeness: Are all required sections present and substantive?
3. actionability: Can a founder actually use this? Is it specific enough?
4. stage_calibration: Is the advice appropriate for the startup's stage?
5. no_generic_content: Is it free from platitudes and generic AI boilerplate?

Return ONLY valid JSON:
{
  "domain_accuracy": <1-10>,
  "completeness": <1-10>,
  "actionability": <1-10>,
  "stage_calibration": <1-10>,
  "no_generic_content": <1-10>,
  "overall": <float, weighted average>,
  "primary_weakness": "<one sentence on the biggest quality issue>"
}`;

export interface QualityScore {
  domain_accuracy: number;
  completeness: number;
  actionability: number;
  stage_calibration: number;
  no_generic_content: number;
  overall: number;
  primary_weakness: string;
}

export async function evaluateQuality(
  content: string,
  deliverableType: DeliverableType,
  industry: string,
  stage: string
): Promise<QualityScore> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5", // Haiku is fast + cheap for evaluation
    max_tokens: 500,
    system: EVALUATOR_PROMPT,
    messages: [
      {
        role: "user",
        content: `Evaluate this ${deliverableType.replace(/_/g, " ")} for a ${industry} startup at ${stage} stage:\n\n${content.slice(0, 3000)}`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  try {
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const scores = JSON.parse(cleaned) as QualityScore;

    // Recalculate overall as weighted average
    scores.overall = Math.round(
      ((scores.domain_accuracy * 1.5 +
        scores.completeness +
        scores.actionability * 1.5 +
        scores.stage_calibration +
        scores.no_generic_content) /
        6.5) *
        10
    ) / 10;

    return scores;
  } catch {
    // If evaluation fails, return a neutral score
    return {
      domain_accuracy: 7,
      completeness: 7,
      actionability: 7,
      stage_calibration: 7,
      no_generic_content: 7,
      overall: 7.0,
      primary_weakness: "Evaluation unavailable",
    };
  }
}
