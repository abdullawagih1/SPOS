import Anthropic from "@anthropic-ai/sdk";
import type { StartupDNA, Industry, BusinessModel, StartupStage } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACTION_PROMPT = `You are an expert startup analyst with 20+ years of experience evaluating ideas for top-tier VCs (Sequoia, a16z, YC).

Analyze the founder's startup idea and extract structured intelligence.

Return ONLY a valid JSON object — no preamble, no explanation, no markdown code blocks.

JSON schema:
{
  "industry": one of: "healthtech"|"fintech"|"edtech"|"legaltech"|"construction"|"ai_saas"|"marketplace"|"hr_recruitment"|"other",
  "business_model": one of: "b2b_saas"|"b2c_saas"|"b2b2c"|"marketplace"|"services"|"hardware"|"other",
  "stage": one of: "pre_idea"|"pre_seed"|"seed"|"series_a",
  "complexity": {
    "technical": <1-10 integer>,
    "regulatory": <1-10 integer>,
    "market": <1-10 integer>,
    "overall": <1-10 float, average of the three>
  },
  "opportunities": [<string>, <string>, <string>],
  "risks": [<string>, <string>, <string>],
  "expert_team": [
    {
      "name": "<realistic full name>",
      "role": "<specific role title>",
      "background": "<2-sentence credible background>",
      "contribution": "<what this expert adds to the startup specifically>",
      "avatar_initials": "<2 chars>",
      "color": one of: "purple"|"teal"|"coral"|"amber"|"blue"
    }
  ],
  "summary": "<2-3 sentence crisp summary of the startup>",
  "key_concepts": [<string>, <string>, <string>, <string>, <string>]
}

Rules:
- expert_team must have 3-5 people matching the detected industry
- opportunities must be specific and actionable, not generic platitudes
- risks must be honest and concrete, not sanitized
- stage should be inferred from context clues in the description
- all strings must be in the same language as the input`;

export async function parseIdea(rawText: string): Promise<StartupDNA> {
  const startTime = Date.now();

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Analyze this startup idea:\n\n"${rawText}"`,
      },
    ],
    system: EXTRACTION_PROMPT,
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  let dna: StartupDNA;
  try {
    // Strip any accidental markdown fences
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    dna = JSON.parse(cleaned) as StartupDNA;
  } catch {
    throw new Error(
      `Failed to parse DNA from model response: ${responseText.slice(0, 200)}`
    );
  }

  // Validate required fields
  if (!dna.industry || !dna.business_model || !dna.stage) {
    throw new Error("Incomplete DNA: missing required fields");
  }

  console.log(`[idea-parser] Parsed in ${Date.now() - startTime}ms`);
  return dna;
}
