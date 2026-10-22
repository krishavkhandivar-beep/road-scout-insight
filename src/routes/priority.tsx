import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { PageHeader, Select, SeverityBadge, StatusBadge } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { priorityScore, priorityBand, type Defect } from "@/lib/data";

export const Route = createFileRoute("/priority")({
  head: () => ({
    meta: [
      { title: "Inspection Priority · Road Distress Mapper" },
      { name: "description", content: "Ranked list of road defects by severity, confidence and repeat sightings." },
      { property: "og:title", content: "Inspection Priority · Road Distress Mapper" },
      { property: "og:description", content: "Ranked road defects for inspection crews." },
    ],
  }),
  component: Priority,
});

type Key = "score" | "severity" | "confidence" | "sightings" | "road";
const sevRank = { High: 3, Medium: 2, Low: 1 };

function Priority() {
  const { defects } = useStore();
  const nav = useNavigate();
  const [key, setKey] = useState<Key>("score");
  const [asc, setAsc] = useState(false);
  const [band, setBand] = useState("All priorities");
  const [status, setStatus] = useState("Exclude rejected");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const val = (d: Defect) =>
      key === "score" ? priorityScore(d) : key === "severity" ? sevRank[d.severity] : key === "road" ? d.road : (d[key] as number);
    return defects
      .map((d) => ({ ...d, score: priorityScore(d) }))
      .filter((d) => (status === "All statuses" ? true : status === "Exclude rejected" ? d.status !== "Rejected" : d.status === status))
      .filter((d) => band === "All priorities" || priorityBand(d.score) === band)
      .filter((d) => (d.road + d.id + d.type).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        const x = val(a), y = val(b);
        const c = typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number);
        return asc ? c : -c;
      });
  }, [defects, key, asc, band, status, q]);

  const th = (k: Key, label: string) => (
    <th className="px-4 py-3">
      <button onClick={() => (k === key ? setAsc(!asc) : (setKey(k), setAsc(false)))} className={`flex items-center gap-1 ${k === key ? "text-foreground" : ""}`}>
        {label}<ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );

  return (
    <>
      <PageHeader title="Inspection Priority" subtitle="Step 4 — crews work top-down. Score = severity (≤50) + confidence (≤30) + repeat sightings (≤20)." />
      <div className="card mb-5 grid grid-cols-4 items-end gap-4 p-4">
        <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Search
          <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2">
            <Search className="h-4 w-4" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Road, ID or defect type" className="w-full bg-transparent text-sm text-foreground outline-none" />
          </div>
        </label>
        <Select label="Priority" value={band} onChange={setBand} options={["All priorities", "High", "Medium", "Low"]} />
        <Select label="Review status" value={status} onChange={setStatus} options={["Exclude rejected", "All statuses", "Pending", "Confirmed", "Corrected", "Rejected"]} />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Defect</th>
              {th("road", "Location")}
              {th("severity", "Severity")}
              {th("confidence", "Confidence")}
              {th("sightings", "Sightings")}
              <th className="px-4 py-3">Status</th>
              {th("score", "Priority score")}
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => {
              const b = priorityBand(d.score);
              return (
                <tr key={d.id} onClick={() => nav({ to: "/review", search: { id: d.id } })} className="cursor-pointer border-t border-border hover:bg-secondary/60">
                  <td className="px-4 py-3 font-mono font-bold">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-3"><div className="font-semibold">{d.type}</div><div className="font-mono text-xs text-muted-foreground">{d.id}</div></td>
                  <td className="px-4 py-3"><div className="font-medium">{d.road}</div><div className="text-xs text-muted-foreground">{d.ward}</div></td>
                  <td className="px-4 py-3"><SeverityBadge s={d.severity} /></td>
                  <td className="px-4 py-3 font-mono">{Math.round(d.confidence * 100)}%</td>
                  <td className="px-4 py-3 font-mono">{d.sightings}×</td>
                  <td className="px-4 py-3"><StatusBadge s={d.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-20 rounded-full bg-secondary"><div className="h-full rounded-full" style={{ width: `${d.score}%`, background: `var(--${b.toLowerCase()})` }} /></div>
                      <span className="w-7 font-mono font-bold">{d.score}</span>
                      <SeverityBadge s={b} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">No defects match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
