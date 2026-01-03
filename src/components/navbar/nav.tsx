"use client"

import useSWR from "swr"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api-client"
import AuthStatus from "../auth/auth-status"
import Image from "next/image"
import { Wallet2 } from "lucide-react"

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
      <div className="mx-auto flex h-15 w-full items-center justify-between px-3 md:px-4 ">
        {/* Left: Brand */}
        <div className="flex">
          <Link href="/" className="font-semibold items-center tracking-wide flex text-base md:text-lg gap-2 ">
<svg className="group h-5 fill-none stroke-current stroke-2 [stroke-linecap:round]" viewBox="0 0 18 13" xmlns="http://www.w3.org/2000/svg">
        <line x1="1" y1="5" x2="1" y2="10"></line>

        <line x1="5" y1="1" x2="5" y2="8">
            <animate attributeName="y2" values="8;10;12;10;8;" dur="3s" begin="indefinite" keyTimes="0;0.3;0.5;0.7;1" keySplines="0.6 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 0.4 1" calcMode="spline"></animate>
        </line>

        <line x1="9" y1="5" x2="9" y2="10">
            <animate attributeName="y2" values="10;8;10;12;10;" dur="3s" begin="indefinite" keyTimes="0;0.3;0.5;0.7;1" keySplines="0.6 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 0.4 1" calcMode="spline"></animate>
        </line>

        <line x1="13" y1="1" x2="13" y2="12">
            <animate attributeName="y2" values="12;10;8;10;12;" dur="3s" begin="indefinite" keyTimes="0;0.3;0.5;0.7;1" keySplines="0.6 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 0.4 1" calcMode="spline"></animate>
        </line>

        <line x1="17" y1="5" x2="17" y2="10">
            <animate attributeName="y2" values="10;12;10;8;10;" dur="3s" begin="indefinite" keyTimes="0;0.3;0.5;0.7;1" keySplines="0.6 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 0.4 1" calcMode="spline"></animate>
        </line>
    </svg>
          {/* <Image src="/flux.png" width={100} height={100} alt="F"/> */}
            Flux
          </Link>
        </div>

        {/* Right: Balance + Logout */}
        <div className="flex justify-around  items-center gap-2">
          <div
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs md:text-sm flex items-center gap-2"
            aria-live="polite"
          >
            <Wallet2 width={20} height={20}/>
            <span className="text-muted-foreground mr-2">Balance</span>
            <span className={isLoading ? "opacity-70" : ""}>{isLoading ? "Loading..." : formattedBalance}</span>
          </div>
            <AuthStatus />
          
        </div>
      </div>
    </header>
  )
}
