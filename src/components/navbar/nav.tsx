"use client"

import useSWR from "swr"
import Link from "next/link"
import {  useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api-client"
import AuthStatus from "../auth/auth-status"
import { Bell, Settings, Wallet2 } from "lucide-react"
import { Button } from "../ui/button"
import { useAssetStore, useTradeStore } from "@/store/useStore"
import { getToken, onAuthChange } from "@/lib/auth"

type BalanceResponse = {
  usd_balance?: number
  message:string
  // allow any other fields from your backend without breaking the UI
//   [key: string]: unknown
}

const fetchBalance = async (): Promise<BalanceResponse | null> => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trade/balance`, {
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

  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    setToken(getToken())
    const off = onAuthChange(() => setToken(getToken()))
    return () => off()
  }, [])

  const loggedIn = !!token

  const { data, isLoading } = useSWR<BalanceResponse | null>("balance", fetchBalance, {
    refreshInterval: 3000,
    revalidateOnFocus: false,
  })

  const [authed, setAuthed] = useState(false)

  const openTrades = useTradeStore((state)=>state.openTrades);
  const prices = useAssetStore((state)=>state.livePrices)

  const getUnrealized = ()=>{

        return     openTrades.reduce((acc,trade)=>{
            const openPriceNumber = parseFloat(trade.openingPrice);
      const quantity = trade.margin*trade.leverage / openPriceNumber
      if(trade.type==="buy"){
        const sellingPrice = (prices[trade.asset] ? prices[trade.asset].ask : 160) * quantity;
        const costPrice = openPriceNumber * quantity;
      const pnl = sellingPrice-costPrice;
      return pnl + acc;
      }else{
        const cp = openPriceNumber * quantity;
        const sp =(prices[trade.asset] ?  prices[trade.asset].bid : 130) * quantity;
        const pnl = cp - sp;
        return pnl + acc;
        // pnl = cost price - sell price
        //  cp = openPrice *qty
        //  sp = livePrice.bid
        // live.buy - open price
      }
    },0) 

  }

  const unrealizedPnl = getUnrealized();

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
    <div className="hidden sm:block">
            Flux
    </div>
          </Link>
        </div>
        <div className="flex justify-around  items-center gap-2">
    {
      loggedIn && (
<>
          <div className="  px-3 py-1.5 text-xs md:text-sm md:flex md:items-center md:gap-2">

            <div className="text-xs text-[#62686D]">Unrealized PnL</div>
            <div className={`${unrealizedPnl >= 0 ? "text-green-400" : "text-red-500"} font-semibold`}>$ {unrealizedPnl.toFixed(2)}</div>
          </div>
          <div className="sm:flex hidden">

 <div className="mx-1 h-8  w-px bg-border " />
 <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
          </Button>
          </div>
          <div
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs md:text-sm flex items-center gap-2"
            aria-live="polite"
            >
            <Wallet2 width={20} height={20}/>
            <span className="text-muted-foreground mr-2 hidden sm:block">Balance</span>
            <span className={isLoading ? "opacity-70" : ""}>{isLoading ? "Loading..." : formattedBalance}</span>
          </div>
            </>
      )
    }
            <AuthStatus />
          
        </div>
      </div>
    </header>
  )
}
