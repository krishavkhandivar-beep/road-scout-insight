import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Pencil, X, MapPin, Clock, Camera, Eye, EyeOff, ArrowRight } from "lucide-react";
import { PageHeader, Btn, DetectionImage, SeverityBadge, StatusBadge, Select } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { fmtDate, priorityScore, type DefectType, type Severity } from "@/lib/data";

export const Route = createFileRoute("/review")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({
    meta: [
      { title: "Defect Review · Road Distress Mapper" },
      { name: "description", content: "Human review of AI detections: confirm, correct or reject." },
      { property: "og:title", content: "Defect Review · Road Distress Mapper" },
      { property: "og:description", content: "Human-in-the-loop review of road defect detections." },
    ],
  }),
  component: Review,
});

function Review() {
  const { defects, setStatus } = useStore();
  const { id } = Route.useSearch();
  const nav = useNavigate();
  const queue = defects.filter((d) => d.status === "Pending");
  const d = defects.find((x) => x.id === id) ?? queue[0] ?? defects[0];
  const [overlay, setOverlay] = useState(true);
  const [editing, setEditing] = useState(false);
  const [cType, setCType] = useState<string>(d.type);
  const [cSev, setCSev] = useState<string>(d.severity);

  const next = () => {
    const n = queue.find((x) => x.id !== d.id);
    setEditing(false);
    if (n) { setCType(n.type); setCSev(n.severity); nav({ to: "/review", search: { id: n.id } }); }
  };
  const open = (nid: string) => {
    const n = defects.find((x) => x.id === nid)!;
    setCType(n.type); setCSev(n.severity); setEditing(false);
    nav({ to: "/review", search: { id: nid } });
  };

  return (
    <>
      <PageHeader
        title="Defect Review"
        subtitle="Step 2 — an inspector verifies every detection before it reaches the priority list."
        actions={<Link to="/priority"><Btn>View priority list <ArrowRight className="h-4 w-4" /></Btn></Link>}
      />
      <div className="grid grid-cols-4 gap-5">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Review queue</h2><span className="rounded-full bg-accent px-2 text-xs font-bold text-accent-foreground">{queue.length}</span></div>
          <ul className="max-h-[640px] space-y-2 overflow-auto">
            {defects.map((x) => (
              <li key={x.id}>
                <button onClick={() => open(x.id)} className={`w-full rounded-lg border p-2.5 text-left transition ${x.id === d.id ? "border-accent bg-medium-soft" : "border-border hover:border-accent"}`}>
                  <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold">{x.id}</span><StatusBadge s={x.status} /></div>
                  <div className="mt-1 truncate text-sm font-medium">{x.type} · {x.road}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="card p-4">
              <div className="mb-3 text-sm font-semibold text-muted-foreground">Original image</div>
              <DetectionImage src={d.image} boxes={d.boxes} show={false} className="aspect-[5/3]" />
            </div>
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Detected overlays</span>
                <button onClick={() => setOverlay(!overlay)} className="flex items-center gap-1 text-xs font-semibold text-accent">{overlay ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{overlay ? "Hide" : "Show"}</button>
              </div>
              <DetectionImage src={d.image} boxes={d.boxes} show={overlay} className="aspect-[5/3]" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="card col-span-2 p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-lg font-bold">{d.id}</span>
                <SeverityBadge s={d.severity} />
                <StatusBadge s={d.status} />
                <span className="ml-auto text-sm text-muted-foreground">Priority score <b className="font-mono text-foreground">{priorityScore(d)}</b></span>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Meta icon={MapPin} k="Location" v={d.road} />
                <Meta icon={MapPin} k="Coordinates (sample)" v={`${d.lat.toFixed(5)}, ${d.lng.toFixed(5)}`} mono />
                <Meta icon={Clock} k="Captured" v={fmtDate(d.date)} />
                <Meta icon={Camera} k="Source" v={`Survey vehicle KA-01-G-2231 · ${d.ward}`} />
              </dl>
              <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                <b>Model output:</b> {d.type} at {Math.round(d.confidence * 100)}% confidence, seen in {d.sightings} survey pass{d.sightings > 1 ? "es" : ""}.
              </div>
            </div>

            <div className="card p-5">
              <h3 className="mb-1 font-bold">Human review</h3>
              <p className="mb-4 text-xs text-muted-foreground">Status: <StatusBadge s={d.status} /></p>
              {editing ? (
                <div className="space-y-3">
                  <Select label="Correct defect type" value={cType} onChange={setCType} options={["Pothole", "Crack", "Alligator crack", "Rutting"]} />
                  <Select label="Correct severity" value={cSev} onChange={setCSev} options={["High", "Medium", "Low"]} />
                  <div className="flex gap-2">
                    <Btn variant="accent" className="flex-1" onClick={() => { setStatus(d.id, "Corrected", { type: cType as DefectType, severity: cSev as Severity }); next(); }}>Save</Btn>
                    <Btn onClick={() => setEditing(false)}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Btn variant="primary" className="w-full" onClick={() => { setStatus(d.id, "Confirmed"); next(); }}><Check className="h-4 w-4" />Confirm</Btn>
                  <Btn className="w-full" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Correct</Btn>
                  <Btn className="w-full text-destructive" onClick={() => { setStatus(d.id, "Rejected"); next(); }}><X className="h-4 w-4" />Reject</Btn>
                </div>
              )}
              <Link to="/map" search={{ id: d.id }} className="mt-4 block text-center text-xs font-semibold text-accent">Show on map</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Meta({ icon: I, k, v, mono }: { icon: typeof MapPin; k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <I className="mt-0.5 h-4 w-4 text-accent" />
      <div><dt className="text-xs text-muted-foreground">{k}</dt><dd className={`font-medium ${mono ? "font-mono" : ""}`}>{v}</dd></div>
    </div>
  );
}
