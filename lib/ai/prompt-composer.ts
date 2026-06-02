import Anthropic from "@anthropic-ai/sdk";
import type { StartupDNA, DeliverableType, PromptTemplate } from "@/types";
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
  deliverableType: DeliverableType
): ComposedPrompt {
  const template = getTemplateForDNA(dna, deliverableType);

  // Build the expert role description from the DNA's expert team
  const expertRoles = dna.expert_team
    .map((e) => `- ${e.name} (${e.role}): ${e.background}`)
    .join("\n");

  // Replace placeholders in template layers
  const system = [
    "=== ROLE ===",
    template.role_layer.replace("{{EXPERTS}}", expertRoles),
    "",
    "=== DOMAIN CONTEXT ===",
    template.context_layer
      .replace("{{INDUSTRY}}", dna.industry)
      .replace("{{STAGE}}", dna.stage)
      .replace("{{BUSINESS_MODEL}}", dna.business_model),
    "",
    "=== CONSTRAINTS ===",
    template.constraint_layer.replace("{{STAGE}}", dna.stage),
    "",
    "=== OUTPUT FORMAT ===",
    template.format_layer,
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
  deliverableType: DeliverableType
): AsyncGenerator<string, { fullText: string; templateId: string; tokensUsed: number }> {
  const composed = composePrompt(dna, deliverableType);
  let fullText = "";
  let tokensUsed = 0;

  const stream = await client.messages.stream({
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
  deliverableType: DeliverableType
): Promise<{ content: string; templateId: string; tokensUsed: number }> {
  const composed = composePrompt(dna, deliverableType);
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