import type { StartupDNA } from "@/types";
import { TrendingUp, AlertTriangle, Users, BarChart3 } from "lucide-react";

interface DNACardProps {
  dna: StartupDNA;
}

function isRTL(text: string): boolean {
  const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u0590-\u05FF]/;
  return rtlChars.test(text.slice(0, 100));
}

function ComplexityBar({ value, label }: { value: number; label: string }) {
  const color =
    value <= 3 ? "bg-teal" :
    value <= 6 ? "bg-amber" :
    "bg-coral";

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-ink-3 w-20 text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-paper-3 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <span className="text-xs font-mono text-ink-2 w-6">{value}</span>
    </div>
  );
}

export function DNACard({ dna }: DNACardProps) {
  return (
    <div className="bg-paper border border-line rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="px-6 py-4 border-b border-line bg-paper-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono tracking-[1.5px] text-ink-3">
            STARTUP DNA
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-light text-accent border border-accent-border">
              {dna.industry}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-line text-ink-3">
              {dna.stage.replace(/_/g, "-")}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-line text-ink-3">
              {dna.business_model.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        {dna.summary && (
          <p
            className="text-sm text-ink-2 mt-2 leading-relaxed"
            dir={isRTL(dna.summary) ? "rtl" : "ltr"}
          >
            {dna.summary}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 divide-x divide-line">
        {/* Opportunities */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-teal" />
            <span className="text-[10px] font-mono tracking-wider text-ink-3">
              OPPORTUNITIES
            </span>
          </div>
          <ul className="space-y-2">
            {dna.opportunities.map((opp, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ink-2 leading-relaxed" dir={isRTL(opp) ? "rtl" : "ltr"}>
                <span className="text-teal mt-0.5 flex-shrink-0">→</span>
                {opp}
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber" />
            <span className="text-[10px] font-mono tracking-wider text-ink-3">
              KEY RISKS
            </span>
          </div>
          <ul className="space-y-2">
            {dna.risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ink-2 leading-relaxed" dir={isRTL(risk) ? "rtl" : "ltr"}>
                <span className="text-amber mt-0.5 flex-shrink-0">!</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>

        {/* Complexity + Experts */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-mono tracking-wider text-ink-3">
              COMPLEXITY
            </span>
          </div>
          <div className="space-y-2 mb-5">
            <ComplexityBar value={dna.complexity.technical} label="Technical" />
            <ComplexityBar value={dna.complexity.regulatory} label="Regulatory" />
            <ComplexityBar value={dna.complexity.market} label="Market" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-mono tracking-wider text-ink-3">
              EXPERT TEAM
            </span>
          </div>
          <div className="space-y-2">
            {dna.expert_team.slice(0, 4).map((expert) => (
              <div key={expert.name} className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium flex-shrink-0 avatar-${expert.color}`}
                >
                  {expert.avatar_initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink truncate">
                    {expert.name}
                  </p>
                  <p className="text-[10px] text-ink-3 truncate">{expert.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key concepts */}
      {dna.key_concepts?.length > 0 && (
        <div className="px-6 py-3 border-t border-line bg-paper-2 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-ink-3 mr-1">CONCEPTS:</span>
          {dna.key_concepts.map((concept) => (
            <span
              key={concept}
              className="text-[10px] font-mono px-2 py-0.5 rounded border border-line text-ink-3 bg-paper"
            >
              {concept}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
