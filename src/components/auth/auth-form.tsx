
"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { setAuthToken, getAuthToken, clearAuthToken } from "@/lib/auth-token"
import { apiFetch } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Mode = "sign-in" | "sign-up"

export default function AuthForm({
  mode,
  title,
  subtitle,
  footer,
}: {
  mode: Mode
  title: string
  subtitle?: string
  footer?: React.ReactNode
}) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(getAuthToken())
  }, [])

  const actionLabel = useMemo(() => (mode === "sign-in" ? "Sign in" : "Sign up"), [mode])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/auth/${mode === "sign-in" ? "signin" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || "Request failed")
      }

      const data = await res.json()

      if (mode === "sign-in") {
        if (!data?.token) throw new Error("No token returned")
        setAuthToken(data.token)
        setToken(data.token)
        setMessage("Signed in successfully. Token stored and will be used for Authorization.")
        // router.push("/") // Uncomment if you want to redirect
      } else {
        setMessage("Account created. You can sign in now.")
        // Optionally auto-redirect to sign-in:
        // router.push("/sign-in")
      }
    } catch (err: any) {
      setMessage(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function testAuthorized() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await apiFetch("/api/protected", { method: "GET" })
      const data = await res.json()
      setMessage(`Authorized OK: ${data?.message || "success"}`)
    } catch (err: any) {
      setMessage(err.message || "Authorized request failed")
    } finally {
      setLoading(false)
    }
  }

  function signOut() {
    clearAuthToken()
    setToken(null)
    setMessage("Signed out and token cleared.")
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourusername"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Please wait..." : actionLabel}
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          {mode === "sign-in" ? (
            <>
              <Button variant="secondary" onClick={testAuthorized} disabled={loading} className="w-full">
                Test authorized request
              </Button>
              {token ? (
                <Button variant="ghost" onClick={signOut} disabled={loading} className="w-full">
                  Sign out (clear token)
                </Button>
              ) : null}
            </>
          ) : null}
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </CardContent>
      <CardFooter className="justify-center">{footer}</CardFooter>
    </Card>
  )
}
