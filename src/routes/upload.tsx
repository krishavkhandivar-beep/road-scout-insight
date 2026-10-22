import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UploadCloud, FileImage, ScanSearch, CheckCircle2, ArrowRight, Info } from "lucide-react";
import { PageHeader, Btn, DetectionImage, Select } from "@/components/ui-kit";
import { images, sampleBoxes, type Defect, type Severity } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload & Detect · Road Distress Mapper" },
      { name: "description", content: "Upload road survey images or video and run defect detection." },
      { property: "og:title", content: "Upload & Detect · Road Distress Mapper" },
      { property: "og:description", content: "Upload road survey media and detect potholes and cracks." },
    ],
  }),
  component: Upload,
});

type Phase = "idle" | "uploading" | "ready" | "detecting" | "done";

function Upload() {
  const { addDefects } = useStore();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(images.road1);
  const [drag, setDrag] = useState(false);
  const [road, setRoad] = useState("Cunningham Rd, Vasanth Nagar");
  const inputRef = useRef<HTMLInputElement>(null);
  const boxes = preview === images.road2 ? sampleBoxes.road2 : sampleBoxes.road1;

  const start = (name: string, url?: string) => {
    setFileName(name);
    setPreview(url ?? images.road1);
    setPhase("uploading");
    setProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p += 7 + Math.random() * 10;
      if (p >= 100) { p = 100; clearInterval(t); setPhase("ready"); }
      setProgress(Math.round(p));
    }, 120);
  };

  const onFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    // Uploaded media is shown locally; the overlay uses demo boxes, so we show the sample frame instead for alignment.
    start(f.name);
  };

  const detect = () => {
    setPhase("detecting");
    setTimeout(() => setPhase("done"), 1600);
  };

  const send = () => {
    const now = new Date().toISOString();
    const sev = (c: number): Severity => (c > 0.9 ? "High" : c > 0.8 ? "Medium" : "Low");
    const base = 1043 + Math.floor(Math.random() * 50);
    const nd: Defect[] = boxes.map((b, i) => ({
      id: `D-${base + i}`,
      type: b.label,
      severity: sev(b.conf),
      confidence: b.conf,
      sightings: 1,
      road,
      ward: "Ward 93",
      lat: 12.9857 + i * 0.0004,
      lng: 77.5946 + i * 0.0003,
      date: now,
      status: "Pending",
      image: preview,
      boxes: [b],
      mapX: 46 + i * 4,
      mapY: 26 + i * 3,
    }));
    addDefects(nd);
    setPhase("idle");
    setSentIds(nd.map((d) => d.id));
  };
  const [sentIds, setSentIds] = useState<string[]>([]);

  return (
    <>
      <PageHeader title="Upload & Detect" subtitle="Step 1 of the inspection workflow — add survey media and run defect detection." />
      <div className="mb-5 flex items-start gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-secondary-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Prototype mode: detection results below are pre-computed sample outputs, not live model inference. Location is entered manually.
      </div>

      {sentIds.length > 0 && (
        <div className="card mb-5 flex items-center justify-between border-low p-4">
          <div className="flex items-center gap-3 text-sm"><CheckCircle2 className="h-5 w-5 text-low" /><span><b>{sentIds.join(", ")}</b> added to the review queue.</span></div>
          <Link to="/review" search={{ id: sentIds[0] }}><Btn variant="accent">Review now <ArrowRight className="h-4 w-4" /></Btn></Link>
        </div>
      )}

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-2 space-y-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-10 text-center transition ${drag ? "border-accent bg-medium-soft" : "hover:border-accent"}`}
          >
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary"><UploadCloud className="h-7 w-7" /></div>
            <div className="font-bold">Drag & drop road images or video</div>
            <div className="mt-1 text-sm text-muted-foreground">JPG, PNG, MP4 · up to 500 MB</div>
            <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />
          </div>

          <div className="card p-5">
            <div className="mb-3 text-sm font-semibold">Or try a sample survey frame</div>
            <div className="grid grid-cols-2 gap-3">
              {[{ src: images.road1, n: "dashcam_cunningham_0412.jpg" }, { src: images.road2, n: "survey_frame_0877.jpg" }].map((s) => (
                <button key={s.n} onClick={() => start(s.n, s.src)} className="overflow-hidden rounded-lg border border-border text-left transition hover:border-accent">
                  <img src={s.src} alt="" className="h-24 w-full object-cover" />
                  <div className="truncate px-2 py-1.5 font-mono text-[11px]">{s.n}</div>
                </button>
              ))}
            </div>
          </div>

          {phase !== "idle" && (
            <div className="card space-y-4 p-5">
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{fileName}</div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <span className="font-mono text-sm font-semibold">{progress}%</span>
              </div>
              <Select label="Road / location" value={road} onChange={setRoad} options={["Cunningham Rd, Vasanth Nagar", "Lavelle Rd", "Richmond Rd", "Infantry Rd"]} />
              <Btn variant="accent" className="w-full py-3" disabled={phase !== "ready"} onClick={detect}>
                <ScanSearch className="h-4 w-4" />{phase === "detecting" ? "Detecting…" : phase === "done" ? "Detection complete" : "Detect Road Defects"}
              </Btn>
            </div>
          )}
        </div>

        <div className="card col-span-3 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Detection preview</h2>
            {phase === "done" && <span className="text-sm text-muted-foreground">{boxes.length} defects found</span>}
          </div>
          {phase === "idle" ? (
            <div className="grid h-[380px] place-items-center rounded-xl bg-muted text-sm text-muted-foreground">Upload a file or pick a sample to begin</div>
          ) : (
            <div className="relative">
              <DetectionImage src={preview} boxes={boxes} show={phase === "done"} className="aspect-[5/3]" />
              {phase === "detecting" && (
                <div className="absolute inset-0 grid place-items-center rounded-xl bg-primary/40">
                  <div className="rounded-lg bg-card px-4 py-2 text-sm font-semibold">Analysing frame…</div>
                </div>
              )}
            </div>
          )}
          {phase === "done" && (
            <>
              <table className="mt-5 w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground"><tr><th className="pb-2">Detection</th><th>Type</th><th>Confidence</th></tr></thead>
                <tbody>
                  {boxes.map((b, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-2 font-mono">#{i + 1}</td><td className="font-semibold">{b.label}</td>
                      <td><div className="flex items-center gap-2"><div className="h-1.5 w-24 rounded-full bg-secondary"><div className="h-full rounded-full bg-accent" style={{ width: `${b.conf * 100}%` }} /></div><span className="font-mono">{Math.round(b.conf * 100)}%</span></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Btn variant="primary" className="mt-5 w-full py-3" onClick={send}>Send {boxes.length} detections to human review <ArrowRight className="h-4 w-4" /></Btn>
            </>
          )}
        </div>
      </div>
    </>
  );
}
