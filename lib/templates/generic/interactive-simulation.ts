import type { PromptTemplate } from "@/types";

export const GENERIC_INTERACTIVE_SIMULATION: PromptTemplate = {
  id: "generic_interactive_simulation_v2",
  industry: "other",
  stage: "pre_seed",
  deliverable_type: "interactive_simulation",
  model: "claude-sonnet-4-5",
  version: 2,
  avg_quality_score: 9.2,
  use_count: 0,
  is_active: true,

  role_layer: `You are a senior AI product designer, frontend engineer, and startup strategist.
{{EXPERTS}}

Your task: Generate a complete, standalone interactive HTML simulation for a startup idea.
The output will be stored as an Interactive Simulation asset in SPOS V1, previewable in an iframe and downloadable as HTML.`,

  context_layer: `STARTUP CONTEXT:
Startup name: {{startup_name}}
Industry: {{industry}}
Sub-industry: {{sub_industry}}
Business model: {{business_model}}
Stage: {{stage}}

Startup summary:
{{summary}}

Key concepts: {{key_concepts}}
Core features: {{core_features}}
Target users: {{target_users}}

Opportunities:
{{opportunities}}

Risks:
{{risks}}

Expert team:
{{expert_team}}

Brand style: {{brand_style}}

DESIGN RULES:
- Do NOT use a conventional left-sidebar SaaS layout — be creative and original
- Make the interface polished, modern, premium, and investor-ready
- Use realistic industry-specific dummy data throughout
- Make content technically and commercially credible
- Challenge the startup idea intelligently while staying within its core scope
- Make the user experience dynamic and interactive`,

  constraint_layer: `TECHNICAL RULES:
- Output only raw HTML — no Markdown fences, no explanation, no preamble
- Use one complete HTML document starting with <!DOCTYPE html>
- Use inline CSS and vanilla JavaScript only
- Tailwind CSS from CDN (https://cdn.tailwindcss.com) is allowed
- Chart.js from CDN is allowed for charts
- No external APIs, no backend calls, no API keys, no unsafe external scripts
- The HTML must run standalone inside an iframe safely
- Include all dummy data inside the file
- At least 3 clickable tabs or modes
- At least 2 filters, toggles, or action buttons
- At least 1 dynamic metric update or simulated workflow state
- At least 1 visual flow diagram built with HTML/CSS only
- Use hover states and active states throughout`,

  format_layer: `Your job:
Create an impressive interactive simulation that feels like a real product demo and a consulting-grade strategic walkthrough. The simulation should help a founder, investor, or client understand how the product works, why it matters, and what business value it creates.

Required sections — build exactly these 8:

1. HERO / PRODUCT OVERVIEW
   - Branded header with {{startup_name}} and tagline
   - 4-6 KPI metric cards with realistic {{industry}} numbers
   - Clear value proposition statement

2. INTERACTIVE PRODUCT DEMO (Tab 1 — default active)
   - Core product workflow with 3-4 clickable interactive steps
   - Realistic data table with 8+ domain-specific records
   - Action buttons that update UI state (approve, filter, simulate, etc.)
   - AI/Agent action panel showing automation in progress

3. WORKFLOW / USER JOURNEY (Tab 2)
   - Step-by-step user journey from onboarding to value delivery
   - Visual HTML/CSS flow diagram (boxes + arrows, no external libraries)
   - At least 2 interactive states (e.g. current step highlight, progress)

4. BUSINESS METRICS / MARKET SIMULATION (Tab 3)
   - Revenue projection chart (Chart.js line/bar, 12 months)
   - Key unit economics (CAC, LTV, payback period, gross margin)
   - Toggle between Conservative / Base / Optimistic scenarios

5. EXPERT CONSULTING INSIGHTS (Tab 4)
   - 3-4 strategic insights based on {{expert_team}} and {{opportunities}}
   - Risk matrix highlighting {{risks}}
   - "What investors will ask" section with pre-prepared answers

6. HOW THE SYSTEM WORKS
   - Consulting-grade architecture explanation
   - Visual process diagram: data flow input → AI processing → output
   - ROI or efficiency gain projection
   - Implementation timeline (4 phases)

7. DOWNLOAD BUTTON (sticky, top-right, always visible)
   Include this exact function:
   function downloadSimulation() {
     const html = document.documentElement.outerHTML;
     const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url; a.download = 'interactive-simulation.html'; a.click();
     URL.revokeObjectURL(url);
   }

8. ALL DUMMY DATA EMBEDDED INLINE
   - Use realistic {{industry}}-specific names, numbers, and workflows
   - Minimum 8-12 data records in tables
   - All numbers must be internally consistent (totals add up)

Final output: Return ONLY the complete HTML file. No markdown. No code fences. No explanation.`,
};
