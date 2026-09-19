// Manages the credentials for the optional login screen. The server
// only requires auth when APP_USERNAME/APP_PASSWORD are configured
// see server/middleware/basicAuth.js
const STORAGE_KEY = 'yogitrack_auth'

export function getStoredAuth() {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredAuth(value) {
  try {
    sessionStorage.setItem(STORAGE_KEY, value)
  } catch {
    // ignore storage errors
  }
}

export function clearStoredAuth() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function encodeCredentials(username, password) {
  return 'Basic ' + btoa(`${username}:${password}`)
}

// Single request that figures out where things stand:
export async function checkAuth() {
  const stored = getStoredAuth()
  const res = await fetch('/api/health', {
    headers: stored ? { Authorization: stored } : {},
  })
  if (res.ok) return stored ? 'ok' : 'none'
  if (stored) clearStoredAuth()
  return 'required'
}
