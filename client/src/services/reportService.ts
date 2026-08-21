import type {
  HazardReport,
} from "../types/hazard";

const STORAGE_KEY =
  "saferoute_hazard_reports";

type NewHazardReport = Omit<
  HazardReport,
  | "id"
  | "status"
  | "verified"
  | "confidence"
  | "createdAt"
>;

export function getHazardReports():
  HazardReport[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function saveHazardReport(
  input: NewHazardReport
): HazardReport {
  const id =
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

  const report: HazardReport = {
    ...input,

    id,

    status: "pending",

    verified: false,

    confidence: 0,

    createdAt:
      new Date().toISOString(),
  };

  const reports =
    getHazardReports();

  reports.unshift(report);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(reports)
  );

  return report;
}