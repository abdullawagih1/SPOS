import { NextRequest } from "next/server";

// Trigger.dev handles its own webhook verification
// This route receives completion callbacks from Trigger.dev cloud
export async function POST(req: NextRequest) {
  // In production: verify the webhook signature from Trigger.dev
  // For now, Trigger.dev SDK handles this internally via the task system
  return new Response("OK", { status: 200 });
}
