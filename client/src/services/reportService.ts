import { API_BASE_URL } from "./api";

import type {
  HazardSeverity,
  HazardType,
} from "../types/hazard";

export type SubmitHazardReportInput = {
  type: HazardType;
  severity: HazardSeverity;

  title: string;
  description: string;

  latitude: number;
  longitude: number;

  photoUrl?: string | null;
};

export type SubmittedHazardReport = {
  id: number;

  type: string;
  severity: string;

  title: string;
  description: string;

  latitude: number;
  longitude: number;

  status: "PENDING";

  confidence: number;

  createdAt: string;
};

type SubmitHazardReportResponse = {
  success: boolean;

  message: string;

  data?: SubmittedHazardReport;

  errors?: Record<
    string,
    string[] | undefined
  >;
};

export class ReportApiError extends Error {
  errors?: Record<
    string,
    string[] | undefined
  >;

  constructor(
    message: string,
    errors?: Record<
      string,
      string[] | undefined
    >
  ) {
    super(message);

    this.name = "ReportApiError";

    this.errors = errors;
  }
}

export async function submitHazardReport(
  input: SubmitHazardReportInput
): Promise<SubmittedHazardReport> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/reports`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          input
        ),
      }
    );
  } catch {
    throw new ReportApiError(
      "Unable to connect to the SafeRoute server."
    );
  }

  let result:
    SubmitHazardReportResponse;

  try {
    result =
      (await response.json()) as
        SubmitHazardReportResponse;
  } catch {
    throw new ReportApiError(
      "The server returned an invalid response."
    );
  }

  if (
    !response.ok ||
    !result.success
  ) {
    throw new ReportApiError(
      result.message ??
        "Unable to submit hazard report.",
      result.errors
    );
  }

  if (!result.data) {
    throw new ReportApiError(
      "The server did not return the submitted report."
    );
  }

  return result.data;
}