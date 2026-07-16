const API_BASE_URL = "http://localhost/J-Hopping/api";

export async function checkDatabaseConnection() {
  const response = await fetch(`${API_BASE_URL}/health.php`);

  if (!response.ok) {
    throw new Error("Database health check failed");
  }

  return response.json();
}
