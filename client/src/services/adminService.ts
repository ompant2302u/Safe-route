import { API_BASE_URL } from "./api";

const ADMIN_TOKEN_KEY =
  "saferoute_admin_token";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
};

export type PendingReport = {
  id: number;

  type: string;
  severity: string;

  title: string;
  description: string;

  latitude: number;
  longitude: number;

  photoUrl: string | null;

  status: "PENDING";

  confidence: number;

  createdAt: string;

  reviewedAt: string | null;
  reviewedById: number | null;
};

type LoginResponse = {
  success: boolean;
  message: string;

  data?: {
    token: string;
    admin: AdminUser;
  };
};

type PendingReportsResponse = {
  success: boolean;
  message?: string;
  data?: PendingReport[];
};

export class AdminApiError extends Error {
  status: number;

  constructor(
    message: string,
    status = 500
  ) {
    super(message);

    this.name = "AdminApiError";
    this.status = status;
  }
}

export function getAdminToken() {
  return sessionStorage.getItem(
    ADMIN_TOKEN_KEY
  );
}

export function setAdminToken(
  token: string
) {
  sessionStorage.setItem(
    ADMIN_TOKEN_KEY,
    token
  );
}

export function clearAdminToken() {
  sessionStorage.removeItem(
    ADMIN_TOKEN_KEY
  );
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new AdminApiError(
      "The server returned an invalid response.",
      response.status
    );
  }
}

export async function loginAdmin(
  email: string,
  password: string
) {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/admin/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
  } catch {
    throw new AdminApiError(
      "Unable to connect to the SafeRoute server."
    );
  }

  const result =
    await parseResponse<LoginResponse>(
      response
    );

  if (
    !response.ok ||
    !result.success ||
    !result.data
  ) {
    throw new AdminApiError(
      result.message ??
        "Admin login failed.",
      response.status
    );
  }

  setAdminToken(
    result.data.token
  );

  return result.data;
}

async function adminFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token =
    getAdminToken();

  if (!token) {
    throw new AdminApiError(
      "Admin authentication required.",
      401
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,

          ...options.headers,
        },
      }
    );
  } catch {
    throw new AdminApiError(
      "Unable to connect to the SafeRoute server."
    );
  }

  if (response.status === 401) {
    clearAdminToken();

    throw new AdminApiError(
      "Your admin session has expired.",
      401
    );
  }

  return response;
}

export async function getPendingReports():
  Promise<PendingReport[]> {
  const response =
    await adminFetch(
      "/admin/reports/pending"
    );

  const result =
    await parseResponse<
      PendingReportsResponse
    >(response);

  if (
    !response.ok ||
    !result.success
  ) {
    throw new AdminApiError(
      result.message ??
        "Unable to load reports.",
      response.status
    );
  }

  return result.data ?? [];
}

export async function verifyReport(
  reportId: number,
  confidence: number
) {
  const response =
    await adminFetch(
      `/admin/reports/${reportId}/verify`,
      {
        method: "PATCH",

        body: JSON.stringify({
          confidence,
        }),
      }
    );

  const result =
    await parseResponse<{
      success: boolean;
      message: string;
    }>(response);

  if (
    !response.ok ||
    !result.success
  ) {
    throw new AdminApiError(
      result.message ??
        "Unable to verify report.",
      response.status
    );
  }

  return result;
}

export async function rejectReport(
  reportId: number
) {
  const response =
    await adminFetch(
      `/admin/reports/${reportId}/reject`,
      {
        method: "PATCH",
      }
    );

  const result =
    await parseResponse<{
      success: boolean;
      message: string;
    }>(response);

  if (
    !response.ok ||
    !result.success
  ) {
    throw new AdminApiError(
      result.message ??
        "Unable to reject report.",
      response.status
    );
  }

  return result;
}