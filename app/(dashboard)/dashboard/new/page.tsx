"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lightbulb } from "lucide-react";

const EXAMPLE_IDEAS = [
  "AI-powered women's health platform with cycle tracking and telehealth access",
  "Construction project management ERP with automated compliance and cost estimation",
  "Legal AI copilot for small law firms — contract review, research, and drafting",
  "EdTech platform for personalized K-12 learning with AI tutoring",
];

export default function NewProjectPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ideas/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: idea.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Analysis failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/project/${data.project_id}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-10">
          <p className="font-mono text-xs tracking-[2px] text-ink-3 mb-3">NEW PROJECT</p>
          <h1 className="font-display font-bold text-3xl text-ink leading-tight">
            Describe your startup idea
          </h1>
          <p className="text-sm text-ink-2 mt-2">
            Write in plain language. SPOS will detect the industry, stage, and complexity — and assemble your expert team automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-[#FCEBEB] border border-[#F09595] rounded-lg px-4 py-3 text-sm text-[#791F1F] mb-4">
              {error}
            </div>
          )}

          <div className="relative">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="I want to build an AI-powered platform that..."
              rows={5}
              disabled={loading}
              className="w-full border border-line rounded-xl px-5 py-4 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 transition-shadow resize-none placeholder:text-ink-3 disabled:opacity-60"
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-ink-3">
              {idea.length < 20 ? "Be specific — more detail = better analysis" : "Good — ready to analyze"}
            </p>
            <button
              type="submit"
              disabled={loading || idea.trim().length < 10}
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Analyzing idea...</>
              ) : (
                <>Analyze idea<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-8 bg-accent-light border border-accent-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Analyzing your idea</p>
                <p className="text-xs text-ink-3">Detecting industry, assembling expert team...</p>
              </div>
            </div>
            <div className="space-y-2">
              {["Extracting core concepts", "Detecting industry and business model", "Identifying opportunities and risks", "Assembling expert advisory team"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  <span className="text-xs text-ink-2">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <div className="mt-8">
            <p className="flex items-center gap-2 text-xs text-ink-3 mb-3">
              <Lightbulb className="w-3.5 h-3.5" />
              Example ideas
            </p>
            <div className="space-y-2">
              {EXAMPLE_IDEAS.map((example) => (
                <button
                  key={example}
                  onClick={() => setIdea(example)}
                  className="w-full text-left text-xs text-ink-2 px-4 py-3 border border-line rounded-lg hover:border-accent/40 hover:bg-accent-light/30 transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
