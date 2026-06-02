import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, Plus, Settings, LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-paper-2 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-paper border-r border-line flex flex-col sticky top-0 h-screen overflow-y-auto flex-shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-line">
          <span className="font-display font-bold text-sm tracking-widest text-ink">
            SPOS
          </span>
          <span className="ml-2 text-[10px] font-mono bg-accent text-white px-1.5 py-0.5 rounded">
            BETA
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Projects
          </Link>
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-accent hover:bg-accent-light transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New project
          </Link>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-line">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center">
              <span className="text-[11px] font-medium text-accent">
                {user.email?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink truncate">
                {user.email?.split("@")[0]}
              </p>
              <p className="text-[10px] font-mono text-ink-3">Free plan</p>
            </div>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded text-xs text-ink-3 hover:text-ink hover:bg-paper-2 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-ink-3 hover:text-ink hover:bg-paper-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-h-screen">{children}</main>
    </div>
  );
}
