import { createContext, useContext, useState, type ReactNode } from "react";
import { seedDefects, type Defect, type ReviewStatus } from "./data";

interface Activity { id: string; text: string; time: string; kind: "upload" | "review" | "detect" }

interface Store {
  defects: Defect[];
  activity: Activity[];
  addDefects: (d: Defect[]) => void;
  setStatus: (id: string, s: ReviewStatus, patch?: Partial<Defect>) => void;
}

const Ctx = createContext<Store | null>(null);

const seedActivity: Activity[] = [
  { id: "a1", text: "Inspector R. Kumar confirmed D-1039 at Silk Board Jn", time: "18 min ago", kind: "review" },
  { id: "a2", text: "Survey video uploaded — Old Airport Rd (2.4 km)", time: "1 h ago", kind: "upload" },
  { id: "a3", text: "2 defects detected on Old Airport Rd", time: "1 h ago", kind: "detect" },
  { id: "a4", text: "D-1033 corrected: Pothole → Rutting", time: "Yesterday", kind: "review" },
  { id: "a5", text: "D-1020 rejected as shadow / false positive", time: "2 days ago", kind: "review" },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [defects, setDefects] = useState<Defect[]>(seedDefects);
  const [activity, setActivity] = useState<Activity[]>(seedActivity);
  const log = (text: string, kind: Activity["kind"]) =>
    setActivity((a) => [{ id: crypto.randomUUID(), text, time: "Just now", kind }, ...a].slice(0, 8));

  return (
    <Ctx.Provider
      value={{
        defects,
        activity,
        addDefects: (d) => {
          setDefects((prev) => [...d, ...prev]);
          log(`${d.length} defects detected on ${d[0]?.road ?? "upload"} — sent to review`, "detect");
        },
        setStatus: (id, s, patch) => {
          setDefects((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch, status: s } : x)));
          log(`${id} marked ${s.toLowerCase()} by you`, "review");
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}
