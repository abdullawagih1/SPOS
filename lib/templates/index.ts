import type { StartupDNA, DeliverableType, PromptTemplate } from "@/types";
import { HEALTHTECH_INVESTOR_NARRATIVE } from "./healthtech/investor-narrative";
import { HEALTHTECH_MVP_PLAN } from "./healthtech/mvp-plan";
import { HEALTHTECH_MARKET_ANALYSIS } from "./healthtech/market-analysis";
import { HEALTHTECH_ARCHITECTURE_OVERVIEW } from "./healthtech/architecture-overview";
import { HEALTHTECH_AGENT_SYSTEM_DESIGN } from "./healthtech/agent-system-design";
import { HEALTHTECH_PRODUCT_REQUIREMENTS } from "./healthtech/product-requirements";
import { HEALTHTECH_INTERACTIVE_SIMULATION } from "./healthtech/interactive-simulation";
import { GENERIC_MVP_PLAN } from "./generic/mvp-plan";
import { GENERIC_MARKET_ANALYSIS } from "./generic/market-analysis";
import { GENERIC_ARCHITECTURE_OVERVIEW } from "./generic/architecture-overview";
import { GENERIC_AGENT_SYSTEM_DESIGN } from "./generic/agent-system-design";
import { GENERIC_PRODUCT_REQUIREMENTS } from "./generic/product-requirements";
import { GENERIC_INTERACTIVE_SIMULATION } from "./generic/interactive-simulation";
import { CONSTRUCTION_INTERACTIVE_SIMULATION } from "./construction/interactive-simulation";

// Industry-specific templates (highest priority)
const TEMPLATES: PromptTemplate[] = [
  HEALTHTECH_INVESTOR_NARRATIVE,
  HEALTHTECH_MVP_PLAN,
  HEALTHTECH_MARKET_ANALYSIS,
  HEALTHTECH_ARCHITECTURE_OVERVIEW,
  HEALTHTECH_AGENT_SYSTEM_DESIGN,
  HEALTHTECH_PRODUCT_REQUIREMENTS,
  HEALTHTECH_INTERACTIVE_SIMULATION,
  CONSTRUCTION_INTERACTIVE_SIMULATION,
];

// Generic fallback templates
const GENERIC_TEMPLATES: Partial<Record<DeliverableType, PromptTemplate>> = {
  mvp_plan: GENERIC_MVP_PLAN,
  market_analysis: GENERIC_MARKET_ANALYSIS,
  architecture_overview: GENERIC_ARCHITECTURE_OVERVIEW,
  agent_system_design: GENERIC_AGENT_SYSTEM_DESIGN,
  product_requirements: GENERIC_PRODUCT_REQUIREMENTS,
  interactive_simulation: GENERIC_INTERACTIVE_SIMULATION,
};

// Fallback generic investor narrative
const GENERIC_INVESTOR_NARRATIVE: PromptTemplate = {
  id: "generic_investor_narrative_v1",
  industry: "other",
  stage: "pre_seed",
  deliverable_type: "investor_narrative",
  role_layer: `You are a seasoned founding team with deep startup experience:
{{EXPERTS}}

You think like top-tier founders who have raised from YC, Sequoia, and a16z.`,
  context_layer: `You are building a {{INDUSTRY}} startup at {{STAGE}} stage with a {{BUSINESS_MODEL}} model.
Apply standard startup best practices. Be specific and actionable.`,
  constraint_layer: `CRITICAL CONSTRAINTS for {{STAGE}} stage:
- Do NOT use phrases like "revolutionize", "disrupt", "game-changing"
- Do NOT cite market sizes without methodology
- Do NOT recommend strategies unrealistic for this funding stage
- Keep language direct and founder-honest`,
  format_layer: `Structure the investor narrative with these exact sections:
## The problem
[2-3 paragraphs, be specific about who suffers and how much]

## Our insight
[1-2 paragraphs, the non-obvious thing you understand that others don't]

## The solution
[2-3 paragraphs, product description without jargon]

## Market opportunity
[TAM/SAM/SOM with methodology, 1-2 paragraphs]

## Business model
[How you make money, unit economics if available]

## Why us
[Team credibility, unfair advantages]

## What we're asking
[Raise amount, use of funds, key milestones]`,
  model: "claude-sonnet-4-5",
  version: 1,
  avg_quality_score: 7.5,
  use_count: 0,
  is_active: true,
};

/**
 * Find the best matching template for a given DNA + deliverable type.
 * Falls back to generic templates if no exact match.
 */
export function getTemplateForDNA(
  dna: StartupDNA,
  deliverableType: DeliverableType
): PromptTemplate {
  // Exact match: industry + deliverable
  const exact = TEMPLATES.find(
    (t) =>
      t.industry === dna.industry &&
      t.deliverable_type === deliverableType &&
      t.is_active
  );
  if (exact) return exact;

  // Generic fallback from map
  const generic = GENERIC_TEMPLATES[deliverableType];
  if (generic) return generic;

  // Final fallback: investor narrative
  return GENERIC_INVESTOR_NARRATIVE;
}
