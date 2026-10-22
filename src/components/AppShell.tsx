import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, UploadCloud, Map, ListOrdered, ClipboardCheck, Construction, Bell } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, step: null },
  { to: "/upload", label: "Upload & Detect", icon: UploadCloud, step: 1 },
  { to: "/review", label: "Review", icon: ClipboardCheck, step: 2 },
  { to: "/map", label: "Defect Map", icon: Map, step: 3 },
  { to: "/priority", label: "Inspection Priority", icon: ListOrdered, step: 4 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { defects } = useStore();
  const pending = defects.filter((d) => d.status === "Pending").length;

  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="btn-accent grid h-10 w-10 place-items-center rounded-xl"><Construction className="h-5 w-5" /></div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-primary-foreground">Road Distress</div>
            <div className="text-xs opacity-70">Smart Pothole Mapper</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition", active ? "bg-primary-foreground/10 text-primary-foreground" : "opacity-75 hover:bg-primary-foreground/5 hover:opacity-100")}>
                <n.icon className={cn("h-4.5 w-4.5", active && "text-accent")} />
                <span className="flex-1">{n.label}</span>
                {n.to === "/review" && pending > 0 && <span className="rounded-full bg-accent px-2 text-xs font-bold text-accent-foreground">{pending}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl bg-primary-foreground/5 p-4 text-xs leading-relaxed">
          <div className="mb-1 font-semibold text-primary-foreground">Demo workflow</div>
          Upload → Detect → Review → Map → Prioritise. Sample data; detection is simulated.
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-8">
          <div className="text-sm text-muted-foreground">Bengaluru Municipal Corporation · <span className="font-semibold text-foreground">Roads & Infrastructure</span></div>
          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-bold">AS</div>
              <div className="text-sm font-semibold">A. Sharma <span className="font-normal text-muted-foreground">· Engineer</span></div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
