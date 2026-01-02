"use client"
import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import type { Ticker } from "@/components/exchange/ticker-list"
import { useAssetStore, useTradeStore } from "@/store/useStore";
import useSWR from "swr"
import { apiFetch,apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ArrowDownRight, Menu } from "lucide-react"
import { ASSET_LIST, getAssetLogo } from "@/constant/asset"
import Image from "next/image"
import { getAsset } from "node:sea"

type OrderResponse ={
  orderId: string
}  
export default function OrderPanel() {
const [volume, setVolume] = useState("0.50")
const [tpOn, setTpOn] = useState(false)
const [slOn, setSlOn] = useState(false)

const [side, setSide] = useState<"buy" | "sell">("buy")
const leverageStops = [1, 5, 10, 20, 100] as const
const [leverage, setLeverage] = useState<(typeof leverageStops)[number]>(10)
const selectedSymbol = useAssetStore((state) => state.selectedSymbol)
const addTrade = useTradeStore((state) => state.addTrade)

// const livePrices = useAssetStore((state) => state.livePrices)


const price = useAssetStore((state) =>  selectedSymbol ? state.livePrices[selectedSymbol] : null);
const livePrices = useAssetStore((state)=> state.livePrices);
const bid = Number(price?.bid?.toFixed(2) ?? NaN)
const ask = Number(price?.ask?.toFixed(2) ?? NaN)
const mid = useMemo(() => {
    const b = Number.isFinite(bid) ? bid : Number.NaN
    const a = Number.isFinite(ask) ? ask : Number.NaN
    return Number.isFinite(b) && Number.isFinite(a) ? (b + a) / 2 : Number.NaN
  }, [bid, ask])  

  const lots = Number(volume) || 0
  const contractSize = 100 // demo contract size for UI math
  const notional = Number.isFinite(mid) ? mid * lots: 0
  const feeRate = 0.01 // 0.10% example
  const fees = notional*feeRate;
  const margin = leverage > 0 ? notional / leverage : 0  
  
  
  const sendOrder = async (): Promise<OrderResponse | null> => {
    console.log("Sending order to server:", { symbol: selectedSymbol, margin, leverage, type:side });
    try {
      const res = await apiRequest("/trade/create", "POST",
      {
            asset: selectedSymbol,
            margin:Math.trunc(margin*1e2),
            leverage,
            type:side,
          },
      )
  
      const data = (await res) as OrderResponse
      console.log("Received order response:", data);
        addTrade({
          orderId: data.orderId,
          asset: selectedSymbol ?? " ",
          margin,
          leverage,
          type: side,
          openingPrice: (price?.ask)?.toString() ?? " "
        })
        console.log("Order response:", data)
        toast("Order Placed Successfully")
        return data
  
      }
catch (err) {
  console.error("Order request failed:", err)
  toast(err.message)
  return null
}
  }
  

  const confirmLabel =
    side === "buy"
      ? `Confirm Buy ${Number.isFinite(lots) ? volume : ""} lots`
      : side === "sell"
        ? `Confirm Sell ${Number.isFinite(lots) ? volume : ""} lots`
        : "Confirm"

  const confirmClasses =
    side === "sell"
      ? "bg-red-600 text-white hover:bg-red-700"
      : side === "buy"
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "bg-muted text-muted-foreground cursor-not-allowed"
  const [tickerData, setTickerData] = useState<Ticker[]>([])
  const setSelectedSymbol = useAssetStore((state) => state.setSelectedSymbol);
  const updatePrice = useAssetStore((state) => state.updatePrice);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080")

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        // console.log("parsed data", parsed)

        if (parsed.price_updates) {
          setTickerData((prev) => {
            const merged: Record<string, Ticker> = {}

            // keep old values
            prev.forEach((t) => {
              merged[t.asset] = t
            })

            parsed.price_updates.forEach((u: Ticker) => {
              // console.log("update", u)
              const asset = u.asset.toUpperCase()
              const newBid = u.buy 
              const newAsk = u.ask 

              const old = merged[asset]

              merged[asset] = {
                asset,
                buy: newBid,
                ask: newAsk,
                bidChange: old
                  ? newBid > old.buy
                    ? "up"
                    : newBid < old.buy
                      ? "down"
                      : null
                  : null,
                askChange: old
                  ? newAsk > old.ask
                    ? "up"
                    : newAsk < old.ask
                      ? "down"
                      : null
                  : null,
              }
              updatePrice(asset, { bid: newBid, ask: newAsk });
            })
            return Object.values(merged)
          })
        }
      } catch (err) {
        console.error("WS parse error:", err)
      }
    }

    return () => {
      ws.close()
    }
  }, [])


  return (
    <Card className="h-full">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between gap-2 w-full">
  <DropdownMenu >
      <DropdownMenuTrigger asChild>
          <CardTitle className="text-base text-pretty cursor-pointer gap-2 p-2 flex items-center justify-between">
            <Image
              src={getAssetLogo(selectedSymbol ?? "SOL_USDC")}
              width={30}
              height={30}
              alt="ETH" />
            {selectedSymbol}

            {/* <span className="ml-2 text-xs font-normal text-muted-foreground">({selectedSymbol})</span> */}
            <ArrowDownRight width={15} height={20} className=""/>
          </CardTitle>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start" >
        <DropdownMenuLabel>Assets</DropdownMenuLabel>
        <DropdownMenuGroup>
          {/* <DropdownMenuSeparator /> */}
          {ASSET_LIST.map((asset) => (
            <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
            key={asset.key}
            onClick={() => {
              setSelectedSymbol(asset.key);
            }}
            >
            {/* <DropdownMenuSeparator /> */}
              <div className="flex items-center gap-2">
                <Image
                  src={getAssetLogo(asset.key)}
                  width={20}
                  height={20}
                  alt={asset.key}
                  />
                <span className="text-sm">{asset.name}</span>
              </div>
              <DropdownMenuShortcut>{livePrices[asset.key] ? (livePrices[asset.key].bid ??  "--").toString() : "--"}</DropdownMenuShortcut>
            </DropdownMenuItem>
                  </>
          ))}
        </DropdownMenuGroup>

      </DropdownMenuContent>
    </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        {/* Top quote boxes */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-md border p-3 text-right">
            <div className="text-[11px] text-muted-foreground">Sell</div>
            <div className="text-lg font-semibold tabular-nums text-red-400">{Number.isFinite(bid) ? bid : "--"}</div>
          </div>
          <div className="rounded-md border p-3 text-right">
            <div className="text-[11px] text-muted-foreground">Buy</div>
            <div className="text-lg font-semibold tabular-nums text-emerald-400">
              {Number.isFinite(ask) ? ask : "--"}
            </div>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={side === "sell" ? "destructive" : "outline"}
            aria-pressed={side === "sell"}
            onClick={() => setSide("sell")}
            className={side === "sell" ? "h-10" : "h-10 border-red-600/40 text-red-400"}
          >
            Sell
          </Button>
          <Button
            type="button"
            aria-pressed={side === "buy"}
            onClick={() => setSide("buy")}
            className={side === "buy" ? "h-10 bg-emerald-600 text-white hover:bg-emerald-700" : "h-10"}
            variant={side === "buy" ? "default" : "outline"}
          >
            Buy
          </Button>
        </div>

        {/* Controls (no Symbol, no Spread) */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="volume">Volume</Label>
            <Input
              id="volume"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              inputMode="decimal"
              aria-describedby="vol-help"
            />
            <p id="vol-help" className="mt-1 text-[10px] text-muted-foreground">
              Lots
            </p>
          </div>
          <div>
            <Label className="block">Leverage</Label>
            <div className="mt-1 grid grid-cols-5 gap-1">
              {leverageStops.map((lv) => (
                <Button
                  key={lv}
                  type="button"
                  size="sm"
                  variant={leverage === lv ? "default" : "outline"}
                  onClick={() => setLeverage(lv)}
                  className={leverage === lv ? "h-8" : "h-8 bg-transparent text-muted-foreground hover:text-foreground"}
                  aria-pressed={leverage === lv}
                >
                  {lv}x
                </Button>
              ))}
            </div>
          </div>
        </div>



              <div className="pt-2">
                <Button
                  type="button"
                  className={`w-full h-10 ${confirmClasses}`}
                  disabled={!side || !Number.isFinite(notional) || lots <= 0}
                  // onClick placeholder - wire to your submit action
                  onClick={sendOrder}
                >
                  {confirmLabel}
                </Button>
                <Button type="button" variant="secondary" className="mt-2 w-full h-9">
                  Cancel
                </Button>
              </div>
 <div className="mt-2 rounded-md border p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fees:</span>
                  <span className="tabular-nums">≈ {fees.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Leverage:</span>
                  <span className="tabular-nums">1:{leverage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Margin:</span>
                  <span className="tabular-nums">{margin.toFixed(2)} USD</span>
                </div>
              </div>
  
      </CardContent>
    </Card>
  )
}
