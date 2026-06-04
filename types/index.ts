// Core domain types for SPOS

export type Plan = "free" | "pro" | "startup" | "agency" | "enterprise";

export type StartupStage = "pre_idea" | "pre_seed" | "seed" | "series_a";

export type Industry =
  | "healthtech"
  | "fintech"
  | "proptech"
  | "edtech"
  | "legaltech"
  | "construction"
  | "climate"
  | "ecommerce"
  | "ai_saas"
  | "marketplace"
  | "hr_recruitment"
  | "other";

export type BusinessModel =
  | "b2b_saas"
  | "b2c_saas"
  | "b2b2c"
  | "marketplace"
  | "services"
  | "hardware"
  | "other";

export type DeliverableType =
  | "investor_narrative"
  | "market_analysis"
  | "business_model_economics"
  | "mvp_plan"
  | "product_requirements"
  | "architecture_overview"
  | "agent_system_design"
  | "interactive_simulation";

export type JobStatus = "pending" | "running" | "complete" | "failed";

export interface ComplexityScore {
  technical: number; // 1-10
  regulatory: number; // 1-10
  market: number; // 1-10
  overall: number; // computed average
}

export interface ExpertPersona {
  name: string;
  role: string;
  background: string;
  contribution: string;
  avatar_initials: string;
  color: "purple" | "teal" | "coral" | "amber" | "blue";
}

export interface StartupDNA {
  industry: Industry;
  sub_industry?: string;
  business_model: BusinessModel;
  stage: StartupStage;
  complexity: ComplexityScore;
  opportunities: string[];
  risks: string[];
  expert_team: ExpertPersona[];
  summary: string;
  key_concepts: string[];
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  status: "active" | "archived";
  startup_dna: StartupDNA | null;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  project_id: string;
  raw_text: string;
  parsed_dna: StartupDNA | null;
  created_at: string;
}

export interface GeneratedAsset {
  id: string;
  project_id: string;
  template_id: string;
  deliverable_type: DeliverableType;
  content: string;
  quality_score: number | null;
  model_used: string;
  tokens_used: number;
  generation_time_ms: number;
  created_at: string;
}

export interface GenerationJob {
  id: string;
  project_id: string;
  asset_type: DeliverableType;
  status: JobStatus;
  asset_id: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PromptTemplate {
  id: string;
  industry: Industry;
  stage: StartupStage;
  deliverable_type: DeliverableType;
  role_layer: string;
  context_layer: string;
  constraint_layer: string;
  format_layer: string;
  model: string;
  version: number;
  avg_quality_score: number;
  use_count: number;
  is_active: boolean;
}

export type DeliverableConfig = {
  type: DeliverableType;
  label: string;
  description: string;
  estimated_minutes: number;
  credit_cost: number;
  available_on: Plan[];
};

export const DELIVERABLE_CONFIGS: DeliverableConfig[] = [
  {
    type: "investor_narrative",
    label: "Investor narrative",
    description: "Problem, insight, solution, market, traction, ask",
    estimated_minutes: 2,
    credit_cost: 3,
    available_on: ["free", "pro", "startup", "agency", "enterprise"],
  },
  {
    type: "market_analysis",
    label: "Market analysis",
    description: "TAM/SAM/SOM, competitive landscape, positioning",
    estimated_minutes: 3,
    credit_cost: 4,
    available_on: ["free", "pro", "startup", "agency", "enterprise"],
  },
  {
    type: "business_model_economics",
    label: "Business model & unit economics",
    description: "Revenue streams, pricing, CAC/LTV, gross margin, and break-even analysis",
    estimated_minutes: 3,
    credit_cost: 4,
    available_on: ["free", "pro", "startup", "agency", "enterprise"],
  },
  {
    type: "mvp_plan",
    label: "MVP plan",
    description: "Feature prioritization, sprint plan, timeline",
    estimated_minutes: 3,
    credit_cost: 4,
    available_on: ["free", "pro", "startup", "agency", "enterprise"],
  },
  {
    type: "product_requirements",
    label: "Product requirements",
    description: "Full PRD with user stories and acceptance criteria",
    estimated_minutes: 5,
    credit_cost: 6,
    available_on: ["free", "pro", "startup", "agency", "enterprise"],
  },
  {
    type: "architecture_overview",
    label: "Architecture overview",
    description: "Tech stack, system design, database schema",
    estimated_minutes: 4,
    credit_cost: 5,
    available_on: ["free", "pro", "startup", "agency", "enterprise"],
  },
  {
    type: "agent_system_design",
    label: "Agent system design",
    description: "Multi-agent architecture, roles, orchestration",
    estimated_minutes: 4,
    credit_cost: 5,
    available_on: ["free", "pro", "startup", "agency", "enterprise"],
  },
  {
    type: "interactive_simulation",
    label: "Interactive simulation",
    description: "Live HTML demo with dashboard, agent workflow, and sample data",
    estimated_minutes: 5,
    credit_cost: 8,
    available_on: ["free", "pro", "startup", "agency", "enterprise"],
  },
];