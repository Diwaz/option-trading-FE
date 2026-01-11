export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers || {})
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("auth_token")
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`)
      }
    } catch {}
  }
  const resp = await fetch(input, { ...init, headers })
  if (!resp.ok) {
    let msg = "Request failed"
    try {
      const data = await resp.json()
      msg = data?.message || msg
    } catch {}
    throw new Error(msg)
  }
  return resp
}
// api-client.ts
// const API_BASE_URL = "http://localhost:8848/api/v1"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

export async function apiRequest<TResponse,TBody = unknown>(
  endpoint: string,
  method: HttpMethod ,
  body?: TBody
): Promise<TResponse> {
  try {
    // 👇 Load auth token from localStorage
    const token = localStorage.getItem("auth_token")

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${token}` ,
      },
      body:body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const error = await res.json();
      console.log("this error popped up",error.message)
      throw new Error(error.message)
    }

    return (await res.json()) as TResponse;
  } catch (err) {
    console.log("we reached here",err)
    console.error("API request failed:", err)
    throw err
  }
}
