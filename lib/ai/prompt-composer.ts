import Anthropic from "@anthropic-ai/sdk";
import type { StartupDNA, DeliverableType } from "@/types";
import { getTemplateForDNA } from "@/lib/templates";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ComposedPrompt {
  system: string;
  user: string;
  template_id: string;
}

/**
 * Assembles a 4-layer prompt from startup DNA + template library.
 * Layer 1: Role layer (who is doing the work)
 * Layer 2: Context layer (domain-specific knowledge)
 * Layer 3: Constraint layer (what to avoid)
 * Layer 4: Format layer (exact output structure)
 */
export function composePrompt(
  dna: StartupDNA,
  deliverableType: DeliverableType,
  startupName?: string
): ComposedPrompt {
  const template = getTemplateForDNA(dna, deliverableType);

  const expertRoles = dna.expert_team
    .map((e) => `- ${e.name} (${e.role}): ${e.background}`)
    .join("\n");

  const nameToken      = startupName ?? "This Startup";
  const subIndustry    = dna.sub_industry ?? dna.industry;
  const keyFeatures    = dna.key_concepts.slice(0, 6).join(", ");
  const targetUsers    = dna.key_concepts.slice(6, 9).join(", ") || "early adopters and business teams";
  const brandStyle     = `Clean, modern, professional — appropriate for ${dna.industry} at ${dna.stage} stage`;

  function applyTokens(str: string): string {
    return str
      .replace(/{{EXPERTS}}/g, expertRoles)
      .replace(/{{STARTUP_NAME}}/g, nameToken)
      .replace(/{{INDUSTRY}}/g, dna.industry)
      .replace(/{{SUB_INDUSTRY}}/g, subIndustry)
      .replace(/{{STAGE}}/g, dna.stage)
      .replace(/{{BUSINESS_MODEL}}/g, dna.business_model)
      .replace(/{{KEY_FEATURES}}/g, keyFeatures)
      .replace(/{{TARGET_USERS}}/g, targetUsers)
      .replace(/{{BRAND_STYLE}}/g, brandStyle);
  }

  const system = [
    "=== ROLE ===",
    applyTokens(template.role_layer),
    "",
    "=== DOMAIN CONTEXT ===",
    applyTokens(template.context_layer),
    "",
    "=== CONSTRAINTS ===",
    applyTokens(template.constraint_layer),
    "",
    "=== OUTPUT FORMAT ===",
    applyTokens(template.format_layer),
  ].join("\n");

  const opportunitiesText = dna.opportunities
    .map((o, i) => `${i + 1}. ${o}`)
    .join("\n");
  const risksText = dna.risks.map((r, i) => `${i + 1}. ${r}`).join("\n");

  const user = `Generate the ${deliverableType.replace(/_/g, " ")} for this startup:

STARTUP SUMMARY:
${dna.summary}

KEY CONCEPTS:
${dna.key_concepts.join(", ")}

IDENTIFIED OPPORTUNITIES:
${opportunitiesText}

IDENTIFIED RISKS:
${risksText}

Industry: ${dna.industry} | Stage: ${dna.stage} | Model: ${dna.business_model}
Technical complexity: ${dna.complexity.technical}/10 | Regulatory: ${dna.complexity.regulatory}/10`;

  return { system, user, template_id: template.id };
}

/**
 * Generate asset with streaming — yields chunks as they arrive.
 */
export async function* generateAssetStream(
  dna: StartupDNA,
  deliverableType: DeliverableType,
  startupName?: string
): AsyncGenerator<string, { fullText: string; templateId: string; tokensUsed: number }> {
  const composed = composePrompt(dna, deliverableType, startupName);
  let fullText = "";
  let tokensUsed = 0;

  const stream = client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 4000,
    system: composed.system,
    messages: [{ role: "user", content: composed.user }],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      const text = chunk.delta.text;
      fullText += text;
      yield text;
    }
    if (chunk.type === "message_delta" && chunk.usage) {
      tokensUsed = chunk.usage.output_tokens ?? 0;
    }
  }

  return { fullText, templateId: composed.template_id, tokensUsed };
}

/**
 * Non-streaming version for background jobs.
 */
export async function generateAsset(
  dna: StartupDNA,
  deliverableType: DeliverableType,
  startupName?: string
): Promise<{ content: string; templateId: string; tokensUsed: number }> {
  const composed = composePrompt(dna, deliverableType, startupName);
  const startTime = Date.now();

  // Simulation needs more tokens for full HTML — other assets use standard limit
  const maxTokens = deliverableType === "interactive_simulation" ? 8000 : 2500;

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: maxTokens,
    system: composed.system,
    messages: [{ role: "user", content: composed.user }],
  });

  const content =
    message.content[0].type === "text" ? message.content[0].text : "";
  const tokensUsed = message.usage.output_tokens;

  console.log(
    `[prompt-composer] Generated ${deliverableType} in ${Date.now() - startTime}ms, ${tokensUsed} tokens`
  );

  return { content, templateId: composed.template_id, tokensUsed };
}