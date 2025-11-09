"use client"

import useSWR from "swr"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api-client"
import AuthStatus from "../auth/auth-status"


type BalanceResponse = {
  usd_balance?: number
  message:string
  // allow any other fields from your backend without breaking the UI
//   [key: string]: unknown
}

const fetchBalance = async (): Promise<BalanceResponse | null> => {
  try {
    const res = await apiFetch("http://localhost:8848/api/v1/trade/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    const data = (await res.json()) as BalanceResponse
    return data
  } catch {
    // graceful fallback – show em dash when balance cannot be fetched
    return null
  }
}

export default function Navbar() {
  const { data, isLoading, mutate } = useSWR<BalanceResponse | null>("balance", fetchBalance, {
    refreshInterval: 3000,
    revalidateOnFocus: false,
  })

  const [authed, setAuthed] = useState(false)
  useEffect(() => {
    setAuthed(!!localStorage.getItem("auth_token"))
  }, [])

  const formattedBalance = useMemo(() => {
    const val = typeof data?.message === "string" ? parseInt(data.message) : undefined
    console.log("val re val",val)
    if (val == null || Number.isNaN(val)) return "—"
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val)
    } catch {
      return `${val.toFixed(2)} USD`
    }
  }, [data?.message])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("auth_token")
    setAuthed(false)
    // trigger a revalidation so the balance shows as em dash after logout
    mutate(null, { revalidate: true })
  }, [mutate])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/60 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-3 md:px-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-wide text-base md:text-lg">
            100xTrade
          </Link>
        </div>

        {/* Right: Balance + Logout */}
        <div className="flex justify-around  items-center gap-2">
          <div
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs md:text-sm"
            aria-live="polite"
          >
            <span className="text-muted-foreground mr-2">Balance</span>
            <span className={isLoading ? "opacity-70" : ""}>{isLoading ? "Loading..." : formattedBalance}</span>
          </div>
            <AuthStatus />
          
        </div>
      </div>
    </header>
  )
}
