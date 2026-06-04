import type { GeneratedAsset, DeliverableType } from "@/types";

const ASSET_ORDER: Record<DeliverableType, number> = {
  investor_narrative:       1,
  market_analysis:          2,
  business_model_economics: 3,
  mvp_plan:                 4,
  product_requirements:     5,
  architecture_overview:    6,
  agent_system_design:      7,
  interactive_simulation:   8,
};

export function sortAssets(assets: GeneratedAsset[]): GeneratedAsset[] {
  return [...assets].sort((a, b) => {
    const oa = ASSET_ORDER[a.deliverable_type] ?? 99;
    const ob = ASSET_ORDER[b.deliverable_type] ?? 99;
    return oa !== ob ? oa - ob
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}