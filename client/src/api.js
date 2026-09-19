// Thin fetch wrappers shared by every page/form component.
import { getStoredAuth } from './auth'

function authHeaders() {
  const stored = getStoredAuth()
  return stored ? { Authorization: stored } : {}
}

export async function fetchList(path) {
  const res = await fetch(path, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load records");
  return res.json();
}

// Returns the raw ok/status/data instead of throwing on non-2xx,
// since callers need to branch on specific status codes (409 for a
// duplicate-name or schedule conflict, 400 for validation errors).
export async function createRecord(path, payload) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
