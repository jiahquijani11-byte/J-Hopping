import Constants from "expo-constants";

const getApiBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0] ?? "localhost";

  return `http://${host}/J-Hopping/api`;
};

const API_BASE_URL = getApiBaseUrl();

type SignupPayload = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  extensionName: string;
  birthDate: string;
  birthPlace: string;
  email: string;
  contactNumber: string;
  city: string;
  province: string;
  barangay: string;
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
      firstName: string | null;
      lastName: string | null;
      email: string;
      username: string;
      role: "user" | "admin";
    };
  };
}
