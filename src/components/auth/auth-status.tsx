
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {  LogOut, LogOutIcon } from "lucide-react"
import {  clearToken, getToken, onAuthChange } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useSessionState } from "@/store/useStore"

// Shows a "logged in" logo when authenticated and a "logout" logo when not logged in.
// Clicking when logged out opens the popup form.
export default function AuthStatus() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null)
  const resetLogin = useSessionState((state)=>state.removeSession);
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
          <div className="inline-flex items-center gap-2 rounded-md bg-emerald-900/40 border border-emerald-700 px-2.5 py-1.5 text-emerald-200" onClick={()=>{
            resetLogin()
            clearToken();
          }}>
            <LogOutIcon className=" h-3"  aria-label="Logged in" />
            <Button
              size="sm"
              variant="ghost"
              className="h-5 text-white dark:text-emerald-100 hover:text-emerald-50 hover:bg-emerald-800/50 hidden sm:block"
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="text-black dark:text-white  bg-zomc-700 dark:bg-zinc-800  hover:bg-zinc-700 border dark:border-zinc-700"
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
