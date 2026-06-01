import Link from "next/link";
import { ArrowRight, Zap, Brain, FileText, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Nav */}
      <nav className="border-b border-line sticky top-0 bg-paper/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-sm tracking-widest text-ink">
              SPOS
            </span>
            <span className="text-[10px] font-mono bg-accent text-white px-2 py-0.5 rounded">
              BETA
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-ink-2 hover:text-ink transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-accent text-white px-4 py-2 rounded font-medium hover:bg-accent-hover transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <p className="font-mono text-xs tracking-[2px] text-ink-3 mb-6 flex items-center gap-3">
            STARTUP PROMPT OPERATING SYSTEM
            <span className="flex-1 h-px bg-border" />
          </p>

          <h1 className="font-display text-[56px] font-extrabold leading-[1.05] tracking-[-1.5px] text-ink mb-6">
            Turn any idea into a{" "}
            <span className="text-accent">venture-scale</span> blueprint
          </h1>

          <p className="text-lg text-ink-2 leading-relaxed max-w-xl mb-10">
            SPOS understands your startup idea, assembles a virtual expert team,
            and generates investor narratives, MVP plans, and architectures —
            automatically. No prompting required.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-colors text-sm"
            >
              Analyze my idea
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-sm text-ink-3 font-mono">
              Free — no credit card
            </span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Brain,
              label: "Idea intelligence",
              desc: "Industry detection, complexity scoring, opportunity mapping",
              color: "bg-accent-light text-accent",
            },
            {
              icon: Zap,
              label: "Expert team",
              desc: "3–6 domain experts assembled automatically for your idea",
              color: "bg-teal-light text-teal",
            },
            {
              icon: FileText,
              label: "World-class prompts",
              desc: "4-layer prompt assembly — 10× better than raw ChatGPT",
              color: "bg-amber-light text-amber",
            },
            {
              icon: TrendingUp,
              label: "Investor-ready assets",
              desc: "Narrative, MVP plan, market analysis, architecture",
              color: "bg-[#faeee9] text-coral",
            },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div
              key={label}
              className="bg-paper border border-line rounded-lg p-5"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-display text-sm font-semibold mb-2">{label}</h3>
              <p className="text-xs text-ink-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof strip */}
      <div className="border-t border-line bg-paper-2 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="font-mono text-xs text-ink-3 tracking-wider mb-6">
            BUILT FOR FOUNDERS WHO MOVE FAST
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              ["HealthTech", "HIPAA + FDA context"],
              ["FinTech", "Banking reg + risk"],
              ["EdTech", "FERPA + engagement"],
              ["LegalTech", "UPL + compliance"],
              ["AI SaaS", "PLG + enterprise"],
            ].map(([industry, context]) => (
              <div key={industry} className="text-center">
                <div className="text-sm font-medium text-ink">{industry}</div>
                <div className="text-xs text-ink-3 font-mono">{context}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
