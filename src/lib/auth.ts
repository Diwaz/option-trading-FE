
"use client"

const TOKEN_KEY = "auth_token"
const EVENT = "auth:changed"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(TOKEN_KEY, token)
    window.dispatchEvent(new Event(EVENT))
  } catch { }
}

export function clearToken() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(TOKEN_KEY)
    window.dispatchEvent(new Event(EVENT))
  } catch { }
}

export function onAuthChange(cb: () => void) {
  if (typeof window === "undefined") return () => { }
  const handler = () => cb()
  window.addEventListener(EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}
