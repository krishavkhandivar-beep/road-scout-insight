import type { Defect } from "@/lib/data";
import { sevColor } from "./ui-kit";
import { cn } from "@/lib/utils";

/** Schematic city map (illustrative, not real GIS tiles) with clickable defect pins. */
export function CityMap({ defects, selected, onSelect, compact }: { defects: Defect[]; selected?: string | null; onSelect?: (id: string) => void; compact?: boolean }) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl bg-map-land", compact ? "h-64" : "h-full min-h-[520px]")}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 62 C 20 58, 30 70, 50 64 S 80 50, 100 58 L100 66 C 80 60, 60 74, 50 72 S 20 66, 0 70 Z" fill="var(--map-water)" />
        <rect x="18" y="28" width="12" height="12" rx="2" fill="var(--map-park)" />
        <rect x="60" y="14" width="14" height="10" rx="2" fill="var(--map-park)" />
        <circle cx="84" cy="84" r="7" fill="var(--map-park)" />
        <g stroke="var(--map-road)" strokeLinecap="round" fill="none">
          <path d="M0 22 L100 34" strokeWidth="2.4" />
          <path d="M0 48 L100 52" strokeWidth="2.4" />
          <path d="M0 80 L100 76" strokeWidth="2" />
          <path d="M40 0 L44 100" strokeWidth="2.4" />
          <path d="M14 0 L28 100" strokeWidth="1.6" />
          <path d="M70 0 L58 100" strokeWidth="2" />
          <path d="M90 0 L80 100" strokeWidth="1.6" />
          <ellipse cx="50" cy="50" rx="40" ry="38" strokeWidth="1.4" strokeDasharray="0" />
        </g>
      </svg>
      {defects.map((d) => {
        const active = selected === d.id;
        return (
          <button
            key={d.id}
            onClick={() => onSelect?.(d.id)}
            title={`${d.id} · ${d.type}`}
            className={cn("group absolute -translate-x-1/2 -translate-y-full transition", active ? "z-20 scale-125" : "z-10 hover:scale-110")}
            style={{ left: `${d.mapX}%`, top: `${d.mapY}%` }}
          >
            <svg width="26" height="34" viewBox="0 0 26 34" className="drop-shadow-md">
              <path d="M13 33 C 13 33, 1 19, 1 12 A12 12 0 0 1 25 12 C 25 19, 13 33, 13 33 Z" fill={sevColor[d.severity]} stroke="var(--card)" strokeWidth="2" opacity={d.status === "Rejected" ? 0.35 : 1} />
              <circle cx="13" cy="12" r="4.5" fill="var(--card)" />
            </svg>
            {active && <span className="absolute left-1/2 top-[-1.6rem] -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">{d.id}</span>}
          </button>
        );
      })}
      <div className="absolute bottom-3 left-3 flex gap-3 rounded-lg bg-card/95 px-3 py-2 text-xs font-medium shadow">
        {(["High", "Medium", "Low"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: sevColor[s] }} />{s}</span>
        ))}
      </div>
      <div className="absolute right-3 top-3 rounded-md bg-card/95 px-2 py-1 text-[10px] font-medium text-muted-foreground shadow">Schematic map · sample coordinates</div>
    </div>
  );
}
