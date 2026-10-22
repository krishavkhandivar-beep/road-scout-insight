import type { ReactNode } from "react";
import type { Box, ReviewStatus, Severity } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

const sevCls: Record<Severity, string> = {
  High: "bg-high-soft text-high",
  Medium: "bg-medium-soft text-medium",
  Low: "bg-low-soft text-low",
};
export function SeverityBadge({ s }: { s: Severity }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", sevCls[s])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s}
    </span>
  );
}

const stCls: Record<ReviewStatus, string> = {
  Pending: "bg-secondary text-secondary-foreground",
  Confirmed: "bg-low-soft text-low",
  Corrected: "bg-medium-soft text-medium",
  Rejected: "bg-muted text-muted-foreground line-through",
};
export function StatusBadge({ s }: { s: ReviewStatus }) {
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", stCls[s])}>{s === "Pending" ? "Awaiting review" : s}</span>;
}

export const sevColor: Record<Severity, string> = { High: "var(--high)", Medium: "var(--medium)", Low: "var(--low)" };

export function Btn({ variant = "outline", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "accent" | "primary" | "outline" | "ghost" }) {
  const v = {
    accent: "btn-accent hover:brightness-105",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-card text-foreground hover:bg-secondary",
    ghost: "text-foreground hover:bg-secondary",
  }[variant];
  return (
    <button
      {...p}
      className={cn("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50", v, className)}
    />
  );
}

export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function DetectionImage({ src, boxes, show = true, className }: { src: string; boxes: Box[]; show?: boolean; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-muted", className)}>
      <img src={src} alt="Road survey frame" className="block h-full w-full object-cover" />
      {show &&
        boxes.map((b, i) => {
          const color = b.label === "Pothole" ? "var(--high)" : "var(--medium)";
          return (
            <div
              key={i}
              className="absolute rounded-sm border-2 animate-in fade-in zoom-in-95"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, borderColor: color, animationDelay: `${i * 150}ms`, animationFillMode: "both" }}
            >
              <span className="absolute -top-6 left-[-2px] whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold text-accent-foreground" style={{ background: color }}>
                {b.label} {Math.round(b.conf * 100)}%
              </span>
            </div>
          );
        })}
    </div>
  );
}
