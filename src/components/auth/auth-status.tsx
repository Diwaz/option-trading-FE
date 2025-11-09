
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, LogOut } from "lucide-react"
import { clearToken, getToken, onAuthChange } from "@/lib/auth"
import { useRouter } from "next/navigation"
// Shows a "logged in" logo when authenticated and a "logout" logo when not logged in.
// Clicking when logged out opens the popup form.
export default function AuthStatus() {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter();
  useEffect(() => {
    setToken(getToken())
    const off = onAuthChange(() => setToken(getToken()))
    return () => off()
  }, [])

  const loggedIn = !!token

  return (
    <>
      <div className=" ">
        {loggedIn ? (
          <div className="inline-flex items-center gap-2 rounded-md bg-emerald-900/40 border border-emerald-700 px-2.5 py-1.5 text-emerald-200">
            <CheckCircle2 className="size-5" aria-label="Logged in" />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-emerald-100 hover:text-emerald-50 hover:bg-emerald-800/50"
              onClick={() => clearToken()}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
            onClick={() => {
              router.push('/auth/login')
            }}
            aria-label="Open authentication"
            title="Open authentication"
          >
            <LogOut className="mr-2 size-4" />
            Login 
          </Button>
        )}
      </div>
    </>
  )
}
