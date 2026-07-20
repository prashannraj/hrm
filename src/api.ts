const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function apiFetch(input: string, init: RequestInit = {}) {
  const url = input.startsWith("http") ? input : `${API_BASE_URL}${input}`;
  const headers = new Headers(init.headers || {});

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("appan_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return fetch(url, { ...init, headers });
}
