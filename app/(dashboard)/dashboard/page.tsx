import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/db/queries";
import { Plus, ArrowRight, Clock, Zap } from "lucide-react";
import type { Project } from "@/types";

function ProjectCard({ project }: { project: Project }) {
  const dna = project.startup_dna;
  const updatedAt = new Date(project.updated_at);
  const timeAgo = getTimeAgo(updatedAt);

  return (
    <Link
      href={`/dashboard/project/${project.id}`}
      className="block bg-paper border border-line rounded-lg p-5 hover:border-accent/30 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display font-semibold text-sm text-ink group-hover:text-accent transition-colors line-clamp-2 flex-1 mr-3">
          {project.title}
        </h3>
        <ArrowRight className="w-4 h-4 text-ink-3 group-hover:text-accent transition-colors flex-shrink-0 mt-0.5" />
      </div>

      {dna ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-light text-accent border border-accent-border">
              {dna.industry}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-paper-2 text-ink-3 border border-line">
              {dna.stage.replace(/_/g, "-")}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-paper-2 text-ink-3 border border-line">
              {dna.business_model.replace(/_/g, " ")}
            </span>
          </div>

          {dna.summary && (
            <p className="text-xs text-ink-2 line-clamp-2 leading-relaxed">
              {dna.summary}
            </p>
          )}

          <div className="flex items-center gap-3">
            {dna.expert_team.slice(0, 4).map((expert) => (
              <div
                key={expert.name}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium avatar-${expert.color}`}
                title={`${expert.name} — ${expert.role}`}
              >
                {expert.avatar_initials}
              </div>
            ))}
            {dna.expert_team.length > 4 && (
              <span className="text-[10px] text-ink-3">
                +{dna.expert_team.length - 4}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-ink-3">
          <Zap className="w-3.5 h-3.5" />
          <span>Analysis pending</span>
        </div>
      )}

      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-line-subtle">
        <Clock className="w-3 h-3 text-ink-3" />
        <span className="text-[10px] font-mono text-ink-3">{timeAgo}</span>
      </div>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const projects = user ? await getProjects(user.id) : [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Your projects</h1>
          <p className="text-sm text-ink-3 mt-1">
            {projects.length === 0
              ? "No projects yet — start with a startup idea"
              : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-xl bg-accent-light flex items-center justify-center mb-5">
        <Zap className="w-7 h-7 text-accent" />
      </div>
      <h2 className="font-display font-semibold text-lg mb-2">
        Start with your idea
      </h2>
      <p className="text-sm text-ink-2 max-w-xs leading-relaxed mb-6">
        Describe your startup in plain language. SPOS will analyze it and
        build your first expert team in seconds.
      </p>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        <Plus className="w-4 h-4" />
        Analyze my first idea
      </Link>
    </div>
  );
}
