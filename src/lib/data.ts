import road1 from "@/assets/road-1.jpg";
import road2 from "@/assets/road-2.jpg";

export type Severity = "High" | "Medium" | "Low";
export type DefectType = "Pothole" | "Crack" | "Alligator crack" | "Rutting";
export type ReviewStatus = "Pending" | "Confirmed" | "Corrected" | "Rejected";

export interface Box { x: number; y: number; w: number; h: number; label: DefectType; conf: number }

export interface Defect {
  id: string;
  type: DefectType;
  severity: Severity;
  confidence: number;
  sightings: number;
  road: string;
  ward: string;
  lat: number;
  lng: number;
  date: string; // ISO
  status: ReviewStatus;
  image: string;
  boxes: Box[];
  mapX: number; // 0-100 position on schematic map
  mapY: number;
}

export const images = { road1, road2 };

const b1: Box[] = [
  { x: 13, y: 49, w: 25, h: 19, label: "Pothole", conf: 0.94 },
  { x: 62, y: 35, w: 14, h: 7, label: "Pothole", conf: 0.88 },
  { x: 44, y: 30, w: 9, h: 56, label: "Crack", conf: 0.76 },
];
const b2: Box[] = [
  { x: 22, y: 19, w: 35, h: 44, label: "Pothole", conf: 0.91 },
  { x: 58, y: 38, w: 34, h: 48, label: "Alligator crack", conf: 0.82 },
];

const raw: Array<Omit<Defect, "image" | "boxes"> & { img: 1 | 2 }> = [
  { id: "D-1042", type: "Pothole", severity: "High", confidence: 0.94, sightings: 7, road: "MG Road, near Metro Pillar 112", ward: "Ward 12", lat: 12.9756, lng: 77.6066, date: "2026-10-21T09:14:00", status: "Pending", img: 1, mapX: 42, mapY: 38 },
  { id: "D-1041", type: "Alligator crack", severity: "High", confidence: 0.82, sightings: 5, road: "Old Airport Rd, Domlur Flyover", ward: "Ward 88", lat: 12.9611, lng: 77.6387, date: "2026-10-21T08:02:00", status: "Pending", img: 2, mapX: 68, mapY: 52 },
  { id: "D-1039", type: "Pothole", severity: "High", confidence: 0.91, sightings: 4, road: "Hosur Rd, Silk Board Jn", ward: "Ward 151", lat: 12.9172, lng: 77.6228, date: "2026-10-20T18:40:00", status: "Confirmed", img: 2, mapX: 55, mapY: 80 },
  { id: "D-1036", type: "Crack", severity: "Medium", confidence: 0.76, sightings: 3, road: "100 Ft Rd, Indiranagar", ward: "Ward 80", lat: 12.9719, lng: 77.6412, date: "2026-10-20T15:22:00", status: "Pending", img: 1, mapX: 72, mapY: 34 },
  { id: "D-1033", type: "Rutting", severity: "Medium", confidence: 0.71, sightings: 2, road: "Bellary Rd, Hebbal", ward: "Ward 7", lat: 13.0358, lng: 77.597, date: "2026-10-19T11:05:00", status: "Corrected", img: 1, mapX: 40, mapY: 10 },
  { id: "D-1030", type: "Pothole", severity: "Medium", confidence: 0.86, sightings: 3, road: "Outer Ring Rd, Marathahalli", ward: "Ward 85", lat: 12.9569, lng: 77.7011, date: "2026-10-19T09:48:00", status: "Confirmed", img: 2, mapX: 88, mapY: 56 },
  { id: "D-1027", type: "Crack", severity: "Low", confidence: 0.68, sightings: 1, road: "Residency Rd", ward: "Ward 111", lat: 12.9667, lng: 77.6053, date: "2026-10-18T17:30:00", status: "Pending", img: 1, mapX: 36, mapY: 50 },
  { id: "D-1024", type: "Pothole", severity: "High", confidence: 0.89, sightings: 6, road: "Tumkur Rd, Yeshwanthpur", ward: "Ward 37", lat: 13.0285, lng: 77.5401, date: "2026-10-18T07:55:00", status: "Confirmed", img: 1, mapX: 14, mapY: 22 },
  { id: "D-1020", type: "Alligator crack", severity: "Low", confidence: 0.64, sightings: 1, road: "Jayanagar 4th Block", ward: "Ward 169", lat: 12.925, lng: 77.5838, date: "2026-10-17T13:12:00", status: "Rejected", img: 2, mapX: 30, mapY: 74 },
  { id: "D-1018", type: "Crack", severity: "Medium", confidence: 0.79, sightings: 2, road: "Mysore Rd, Kengeri", ward: "Ward 159", lat: 12.9081, lng: 77.4853, date: "2026-10-17T10:40:00", status: "Pending", img: 2, mapX: 8, mapY: 66 },
  { id: "D-1015", type: "Pothole", severity: "Low", confidence: 0.72, sightings: 1, road: "Sarjapur Rd, Bellandur", ward: "Ward 150", lat: 12.9259, lng: 77.6762, date: "2026-10-16T16:20:00", status: "Confirmed", img: 1, mapX: 78, mapY: 74 },
  { id: "D-1011", type: "Rutting", severity: "Low", confidence: 0.66, sightings: 2, road: "Kanakapura Rd, JP Nagar", ward: "Ward 177", lat: 12.8899, lng: 77.5737, date: "2026-10-15T08:30:00", status: "Pending", img: 2, mapX: 26, mapY: 90 },
];

export const seedDefects: Defect[] = raw.map(({ img, ...d }) => ({
  ...d,
  image: img === 1 ? road1 : road2,
  boxes: img === 1 ? b1 : b2,
}));

export const sampleBoxes = { road1: b1, road2: b2 };

const sevWeight: Record<Severity, number> = { High: 50, Medium: 30, Low: 12 };

/** Priority score 0–100: severity weight + confidence (up to 30) + repeat sightings (up to 20). */
export function priorityScore(d: Pick<Defect, "severity" | "confidence" | "sightings" | "status">): number {
  if (d.status === "Rejected") return 0;
  const s = sevWeight[d.severity] + d.confidence * 30 + Math.min(d.sightings, 5) * 4;
  return Math.min(100, Math.round(s));
}

export function priorityBand(score: number): Severity {
  return score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
