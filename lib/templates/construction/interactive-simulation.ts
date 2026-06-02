import type { PromptTemplate } from "@/types";

export const CONSTRUCTION_INTERACTIVE_SIMULATION: PromptTemplate = {
  id: "construction_interactive_simulation_v1",
  industry: "construction",
  stage: "pre_seed",
  deliverable_type: "interactive_simulation",
  model: "claude-sonnet-4-5",
  version: 1,
  avg_quality_score: 9.1,
  use_count: 0,
  is_active: true,

  role_layer: `You are an elite team building a construction/real estate tech simulation:
{{EXPERTS}}

The team includes a CFO with 15+ years in real estate development, an operations consultant
who has worked with Oracle EBS ERP, a collection manager experienced in construction contracting,
and a senior frontend engineer. Your simulation must impress CFOs, operations directors, and
ERP consultants — people who will immediately spot inaccuracies in financial workflows.`,

  context_layer: `CONSTRUCTION/REAL ESTATE SIMULATION STANDARDS:

FINANCIAL ACCURACY:
- Invoice amounts in SAR (Saudi Riyal) for GCC market, or appropriate currency
- Standard payment terms: NET 30, NET 60, NET 90 common in construction
- Retention amounts typically 5-10% of contract value held until completion
- Progress billing based on milestone completion percentages
- VAT at 15% (Saudi Arabia) or relevant jurisdiction

ERP INTEGRATION PATTERNS (Oracle EBS style):
- Invoice numbers follow structured format: INV-YYYY-XXXXX
- Customer codes and project codes alphanumeric
- AR aging buckets: Current, 30 days, 60 days, 90 days, 90+ days
- Workflow states: Draft → Approved → Sent → Partially Paid → Paid → Overdue

COLLECTION WORKFLOW:
- Morning ERP sync at 9:00 AM — show timestamp and record count
- Human-in-the-loop validation before dispatch (collection manager approval)
- Automated email dispatch with PDF invoice attachments
- Follow-up sequence: Day 0 (invoice), Day 15 (reminder), Day 30 (escalation)
- DSO (Days Sales Outstanding) is the primary KPI — industry avg 65-90 days

REALISTIC CONSTRUCTION COMPANY DATA:
- Project types: Commercial towers, residential compounds, infrastructure, fit-out
- Customer types: Government entities, real estate developers, contractors
- Contract values: SAR 500K to SAR 50M range for mid-size contractor
- Multiple projects active simultaneously (5-15 concurrent)

AI AGENT ACTIONS TO SHOW:
- Automated ERP query with results count
- AI risk scoring per invoice (likelihood of late payment based on customer history)
- Draft email generation with customer-specific personalization
- Collection manager approval workflow with one-click dispatch`,

  constraint_layer: `CONSTRUCTION SIMULATION CONSTRAINTS:
- All financial figures must be internally consistent (totals must add up correctly)
- Customer names should be plausible GCC/Saudi company names
- Project names should reflect real construction project types
- Invoice amounts must be realistic for construction (not $/€ unless specified)
- Collection workflow must show human approval step — this is legally important
- AI actions labeled as "AI-assisted" not "automated" for compliance
- Show audit trail — every automated action must be logged and visible`,

  format_layer: `Build a construction/real estate collection management simulation with:

1. EXECUTIVE DASHBOARD (main view)
   - KPI cards: Total AR Outstanding, DSO, Collection Rate this month, Overdue %
   - AR aging chart (bar chart showing current/30/60/90/90+ buckets)
   - Top 5 overdue invoices requiring action
   - Today's AI morning sync status with timestamp

2. INVOICE MANAGEMENT TAB
   - Data table: 10-12 invoices across 3-4 projects
   - Columns: Invoice #, Customer, Project, Amount (SAR), Due Date, Status, AI Risk Score
   - Filter by: Project, Status, Date range, Risk level
   - Bulk select for dispatch
   - Color-coded status badges

3. AI COLLECTION AGENT TAB
   - Morning sync animation: "Querying ERP... Found 8 new invoices"
   - Collection manager review panel with approve/reject per invoice
   - AI-generated email preview per customer (personalized)
   - One-click dispatch with confirmation
   - Dispatch log with timestamps

4. ANALYTICS TAB
   - Monthly collection trend (line chart, 6 months)
   - Customer payment behavior analysis
   - Project profitability view
   - Forecast: Expected collections next 30 days

5. HOW IT WORKS section (consulting-grade)
   - System architecture: ERP → AI Agent → Collection Manager → Customer
   - Flow diagram with Oracle EBS integration point
   - ROI calculation: Time saved, DSO improvement projection
   - Implementation timeline

Output ONLY the complete HTML file.`,
};
