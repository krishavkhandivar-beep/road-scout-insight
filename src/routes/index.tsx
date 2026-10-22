import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ScanSearch, Route as RouteIcon, UploadCloud, ClipboardCheck, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader, SeverityBadge, StatusBadge, Btn } from "@/components/ui-kit";
import { CityMap } from "@/components/CityMap";
import { priorityScore, fmtDate } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Road Distress Mapper" },
      { name: "description", content: "Overview of detected road defects, high-priority issues and inspection backlog." },
      { property: "og:title", content: "Dashboard · Road Distress Mapper" },
      { property: "og:description", content: "Overview of detected road defects and inspection backlog." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { defects, activity } = useStore();
  const nav = useNavigate();
  const active = defects.filter((d) => d.status !== "Rejected");
  const high = active.filter((d) => d.severity === "High").length;
  const verified = defects.filter((d) => d.status === "Confirmed" || d.status === "Corrected").length;
  const roads = new Set(active.filter((d) => priorityScore(d) >= 50).map((d) => d.road)).size;
  const top = [...active].sort((a, b) => priorityScore(b) - priorityScore(a)).slice(0, 5);

  const stats = [
    { label: "Total defects detected", value: defects.length, icon: ScanSearch, tone: "bg-secondary text-primary", to: "/map" },
    { label: "High-priority issues", value: high, icon: AlertTriangle, tone: "bg-high-soft text-high", to: "/priority" },
    { label: "Verified reports", value: verified, icon: CheckCircle2, tone: "bg-low-soft text-low", to: "/review" },
    { label: "Roads needing inspection", value: roads, icon: RouteIcon, tone: "bg-medium-soft text-medium", to: "/priority" },
  ] as const;

  return (
    <>
      <PageHeader
        title="Road condition overview"
        subtitle="Sample data for the current survey cycle · Oct 15 – Oct 22, 2026"
        actions={<Link to="/upload"><Btn variant="accent"><UploadCloud className="h-4 w-4" />New survey upload</Btn></Link>}
      />
      <div className="grid grid-cols-4 gap-5">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card p-5 transition hover:-translate-y-0.5">
            <div className={`mb-4 grid h-10 w-10 place-items-center rounded-lg ${s.tone}`}><s.icon className="h-5 w-5" /></div>
            <div className="text-3xl font-extrabold">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-5">
        <div className="card col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Defect map preview</h2>
            <Link to="/map" className="flex items-center gap-1 text-sm font-semibold text-accent">Open map <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <CityMap defects={active} compact onSelect={(id) => nav({ to: "/map", search: { id } })} />
        </div>
        <div className="card p-5">
          <h2 className="mb-4 font-bold">Recent activity</h2>
          <ul className="space-y-4">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                  {a.kind === "upload" ? <UploadCloud className="h-3.5 w-3.5" /> : a.kind === "detect" ? <ScanSearch className="h-3.5 w-3.5" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
                </div>
                <div><div className="leading-snug">{a.text}</div><div className="text-xs text-muted-foreground">{a.time}</div></div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Top inspection candidates</h2>
          <Link to="/priority" className="text-sm font-semibold text-accent">View full ranking</Link>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {top.map((d) => (
            <Link key={d.id} to="/review" search={{ id: d.id }} className="rounded-xl border border-border p-3 transition hover:border-accent">
              <img src={d.image} alt="" loading="lazy" className="mb-3 h-24 w-full rounded-lg object-cover" />
              <div className="flex items-center justify-between"><span className="font-mono text-xs font-semibold">{d.id}</span><SeverityBadge s={d.severity} /></div>
              <div className="mt-1 truncate text-sm font-semibold">{d.road}</div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>{fmtDate(d.date)}</span><StatusBadge s={d.status} /></div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
