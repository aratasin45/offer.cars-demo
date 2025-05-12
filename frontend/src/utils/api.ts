const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function fetchAPI(
  endpoint: string,
  method: string = "GET",
  body?: Record<string, unknown>,
  token?: string
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // Cookie 認証が必要なら有効
  });

  if (!res.ok) {
    throw new Error(`APIエラー: ${res.statusText}`);
  }

  return res.json();
}