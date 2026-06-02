import type { GeneratedAsset, DeliverableType } from "@/types";

const ASSET_ORDER: Record<DeliverableType, number> = {
  investor_narrative: 1,
  market_analysis: 2,
  mvp_plan: 3,
  product_requirements: 4,
  architecture_overview: 5,
  agent_system_design: 6,
};

export function sortAssets(assets: GeneratedAsset[]): GeneratedAsset[] {
  return [...assets].sort((a, b) => {
    const orderA = ASSET_ORDER[a.deliverable_type] ?? 99;
    const orderB = ASSET_ORDER[b.deliverable_type] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
