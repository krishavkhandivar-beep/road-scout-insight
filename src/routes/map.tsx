import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Clock, X, ClipboardCheck } from "lucide-react";
import { PageHeader, Select, SeverityBadge, StatusBadge, Btn } from "@/components/ui-kit";
import { CityMap } from "@/components/CityMap";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/data";

export const Route = createFileRoute("/map")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => ({ id: typeof s["id"] === "string" ? (s["id"] as string) : undefined }),
  head: () => ({
    meta: [
      { title: "Defect Map · Road Distress Mapper" },
      { name: "description", content: "Map of detected potholes and cracks with filters by type, severity, date and status." },
      { property: "og:title", content: "Defect Map · Road Distress Mapper" },
      { property: "og:description", content: "Map of detected road defects." },
    ],
  }),
  component: MapPage,
});

const days: Record<string, number> = { "All dates": 9999, "Last 24 hours": 1, "Last 3 days": 3, "Last 7 days": 7 };
const NOW = new Date("2026-10-22T12:00:00").getTime();

function MapPage() {
  const { defects } = useStore();
  const { id } = Route.useSearch();
  const [sel, setSel] = useState<string | null>(id ?? null);
  const [type, setType] = useState("All types");
  const [sev, setSev] = useState("All severities");
  const [date, setDate] = useState("All dates");
  const [status, setStatus] = useState("All statuses");

  const list = useMemo(
    () =>
      defects.filter(
        (d) =>
          (type === "All types" || d.type === type) &&
          (sev === "All severities" || d.severity === sev) &&
          (status === "All statuses" || d.status === status) &&
          (NOW - new Date(d.date).getTime()) / 864e5 <= (days[date] ?? 9999),
      ),
    [defects, type, sev, date, status],
  );
  const d = defects.find((x) => x.id === sel);

  return (
    <>
      <PageHeader title="Defect Map" subtitle="Step 3 — see where verified and pending defects cluster across the city." />
      <div className="card mb-5 grid grid-cols-5 items-end gap-4 p-4">
        <Select label="Defect type" value={type} onChange={setType} options={["All types", "Pothole", "Crack", "Alligator crack", "Rutting"]} />
        <Select label="Severity" value={sev} onChange={setSev} options={["All severities", "High", "Medium", "Low"]} />
        <Select label="Date" value={date} onChange={setDate} options={Object.keys(days)} />
        <Select label="Verification" value={status} onChange={setStatus} options={["All statuses", "Pending", "Confirmed", "Corrected", "Rejected"]} />
        <div className="pb-2 text-right text-sm"><b>{list.length}</b> <span className="text-muted-foreground">of {defects.length} shown</span></div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card col-span-2 p-3"><CityMap defects={list} selected={sel} onSelect={setSel} /></div>
        <div className="card overflow-hidden">
          {d ? (
            <div>
              <div className="relative">
                <img src={d.image} alt="Evidence" className="h-48 w-full object-cover" />
                <button onClick={() => setSel(null)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-card shadow"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between"><span className="font-mono text-sm font-bold">{d.id}</span><SeverityBadge s={d.severity} /></div>
                <div className="text-lg font-bold">{d.type}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2"><MapPin className="h-4 w-4 text-accent" /><div>{d.road}<div className="font-mono text-xs text-muted-foreground">{d.lat.toFixed(4)}, {d.lng.toFixed(4)} · {d.ward}</div></div></div>
                  <div className="flex gap-2"><Clock className="h-4 w-4 text-accent" />{fmtDate(d.date)}</div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm"><span className="text-muted-foreground">Model confidence</span><b className="font-mono">{Math.round(d.confidence * 100)}%</b></div>
                  <div className="h-2 rounded-full bg-secondary"><div className="h-full rounded-full bg-accent" style={{ width: `${d.confidence * 100}%` }} /></div>
                </div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Seen {d.sightings}× in surveys</span><StatusBadge s={d.status} /></div>
                <Link to="/review" search={{ id: d.id }}><Btn variant="accent" className="w-full"><ClipboardCheck className="h-4 w-4" />Open in review</Btn></Link>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <h2 className="mb-1 font-bold">Defects in view</h2>
              <p className="mb-4 text-sm text-muted-foreground">Click a pin or a row to see evidence.</p>
              <ul className="max-h-[460px] space-y-2 overflow-auto">
                {list.map((x) => (
                  <li key={x.id}>
                    <button onClick={() => setSel(x.id)} className="flex w-full items-center gap-3 rounded-lg border border-border p-2 text-left hover:border-accent">
                      <img src={x.image} alt="" className="h-10 w-14 rounded object-cover" />
                      <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{x.road}</div><div className="text-xs text-muted-foreground">{x.id} · {x.type}</div></div>
                      <SeverityBadge s={x.severity} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
