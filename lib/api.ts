import Constants from "expo-constants";

const getApiBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0] ?? "localhost";

  return `http://${host}/J-Hopping/api`;
};

const API_BASE_URL = getApiBaseUrl();

export type ManagerStatus = "active" | "pending" | "suspended";

export type DestinationManager = {
  id: number;
  userId: number;
  businessName: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  extensionName: string | null;
  email: string;
  contactNumber: string;
  username: string;
  status: ManagerStatus;
  createdAt: string;
  updatedAt: string;
};

export type DestinationManagerPayload = {
  businessName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  email: string;
  contactNumber: string;
  username: string;
  password: string;
  status?: ManagerStatus;
};

export type DestinationManagerPage = {
  data: DestinationManager[];
  meta: {
    page: number;
    perPage: number;
    pendingCount: number;
    total: number;
    totalPages: number;
  };
};

export type DestinationManagerQuery = {
  page?: number;
  perPage?: 5 | 10 | 20 | 30;
  search?: string;
  status?: "all" | ManagerStatus;
};

type SignupPayload = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  extensionName: string;
  birthDate: string;
  gender: "male" | "female" | "bisexual" | "gay" | "lesbian" | "prefer_not_to_say";
  email: string;
  contactNumber: string;
  country: string;
  username: string;
  password: string;
};

async function postJson(path: string, payload: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data;
}

async function requestJson(path: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data;
}

export async function checkDatabaseConnection() {
  const response = await fetch(`${API_BASE_URL}/health.php`);

  if (!response.ok) {
    throw new Error("Database health check failed");
  }

  return response.json();
}

export async function signupUser(payload: SignupPayload) {
  return postJson("signup.php", payload);
}

export async function loginUser(payload: { identifier: string; password: string }) {
  const data = await postJson("login.php", payload);
  return data as {
    ok: true;
    message: string;
    data: {
      id: number;
      businessName?: string | null;
      firstName: string | null;
      middleInitial: string | null;
      lastName: string | null;
      extensionName: string | null;
      email: string;
      username: string;
      role: "user" | "admin" | "manager";
    };
  };
}

export async function getDestinationManagers(query: DestinationManagerQuery = {}) {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.perPage) params.set("per_page", String(query.perPage));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.status && query.status !== "all") params.set("status", query.status);

  const data = await requestJson(
    `destination-managers.php${params.size ? `?${params.toString()}` : ""}`,
  );
  return data as { ok: true } & DestinationManagerPage;
}

export async function getDestinationManager(id: number) {
  const data = await requestJson(`destination-managers.php?id=${id}`);
  return data.data as DestinationManager;
}

export async function createDestinationManager(payload: DestinationManagerPayload) {
  const data = await requestJson("destination-managers.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data as DestinationManager;
}

export async function updateDestinationManager(
  id: number,
  payload: DestinationManagerPayload,
) {
  const data = await requestJson(`destination-managers.php?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data as DestinationManager;
}

export async function deleteDestinationManager(id: number) {
  await requestJson(`destination-managers.php?id=${id}`, { method: "DELETE" });
}
