
"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { setToken } from "@/lib/auth"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  baseUrl?: string // default http://localhost:5000
}

export default function AuthModal({ open, onOpenChange, baseUrl = "http://localhost:5000" }: Props) {
  const [tab, setTab] = useState<"signin" | "signup">("signin")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>, path: "signin" | "signup") {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const username = String(fd.get("username") || "").trim()
    const password = String(fd.get("password") || "")

    try {
      const res = await fetch(`${baseUrl}/api/v1/user/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Request failed")

      if (data?.token) {
        setToken(data.token)
        onOpenChange(false)
      } else if (path === "signup") {
        setTab("signin")
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 text-zinc-100 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-balance">Account</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-2 bg-zinc-800">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <form className="grid gap-4" onSubmit={(e) => submit(e, "signin")}>
              <div className="grid gap-2">
                <Label htmlFor="si-username">Username</Label>
                <Input
                  id="si-username"
                  name="username"
                  autoComplete="username"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="si-password">Password</Label>
                <Input
                  id="si-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form className="grid gap-4" onSubmit={(e) => submit(e, "signup")}>
              <div className="grid gap-2">
                <Label htmlFor="su-username">Username</Label>
                <Input
                  id="su-username"
                  name="username"
                  autoComplete="username"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="su-password">Password</Label>
                <Input
                  id="su-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-zinc-400">
          Posting to {`${baseUrl}/api/v1/signin`} and {`${baseUrl}/api/v1/signup`}. Adjust baseUrl in AuthModal if
          needed.
        </p>
      </DialogContent>
    </Dialog>
  )
}
