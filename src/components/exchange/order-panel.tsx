"use client"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Ticker } from "@/components/exchange/ticker-list"
import { useAssetStore, useSessionState, useTradeStore } from "@/store/useStore";
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { ArrowDownRight } from "lucide-react"
import { ASSET_LIST, getAssetLogo } from "@/constant/asset"
import Image from "next/image"
import { Asset, TradeBody, TradeResponse } from "@/types/type"
import { Spinner } from "../ui/spinner"
import { useRouter } from "next/navigation"
import { getToken, onAuthChange, setToken } from "@/lib/auth"

type OrderResponse ={
  orderId: string
}  
export default function OrderPanel() {

  const [token, setToken] = useState<string | null>(null)
const [volume, setVolume] = useState("0.50")

const [createLoading,setCreateLoading] = useState(false);

const [side, setSide] = useState<"buy" | "sell">("buy")
// const leverageStops = [1, 5, 10, 20, 100] as const
const [leverage, setLeverage] = useState(1)
// const [leverageSlider, setleverageSlider] = useState(0)
const selectedSymbol = useAssetStore((state) => state.selectedSymbol)
const addTrade = useTradeStore((state) => state.addTrade)
const router = useRouter();
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
  const notional = Number.isFinite(mid) ? mid * lots: 0
  const feeRate = 0.01 // 0.10% example
  const fees = notional*feeRate;
  const margin = leverage > 0 ? notional / leverage : 0  
  
  
  const sendOrder = async (): Promise<OrderResponse | null> => {
    console.log("Sending order to server:", { symbol: selectedSymbol, margin, leverage, type:side });
    try {
      setCreateLoading(true);
      const res = await apiRequest<TradeResponse,TradeBody>("/trade/create", "POST",
      {
            asset: selectedSymbol ?? "ETH_USDC",
            margin:(Math.trunc(margin*1e2)),
            leverage:leverage,
            slippage:1,
            type:side,
          },
      )
  
      const data = (await res) as OrderResponse
      // console.log("Received order response:", data);
        addTrade({
          orderId: data.orderId,
          asset: selectedSymbol ?? " ",
          margin,
          leverage,
          slippage:1,
          type: side,
          openingPrice: (price?.ask)?.toString() ?? " "
        })
        setCreateLoading(false);
        console.log("Order response:", data)
        toast("Order Placed Successfully")
        return data
  
      }
catch (err) {
  setCreateLoading(false);
console.error("Order Request Failed", err);
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : JSON.stringify(err) || "Order Request Failed";
        toast.error(message);
  return null
}
  }
  

  const confirmLabel =
    side === "buy"
      ? `BUY  ($ ${Number.isFinite(margin) ? margin.toFixed(2) : ""} )`
      : side === "sell"
        ? ` SELL ($ ${Number.isFinite(margin) ? margin.toFixed(2) : ""} )`
        : "Confirm"

  const confirmClasses =
    side === "sell"
      ? "bg-red-600 text-white hover:bg-red-700"
      : side === "buy"
        ? "bg-green-600 text-white hover:bg-green-700"
        : "bg-muted text-muted-foreground cursor-not-allowed"
  const [tickerData, setTickerData] = useState<Ticker[]>([])
  const setSelectedSymbol = useAssetStore((state) => state.setSelectedSymbol);
  const updatePrice = useAssetStore((state) => state.updatePrice);

  // safe finder: normalize asset key and return askChange/bidChange if available
  const findChange = (asset?: string): string | undefined => {
    if (!asset) return "up";
    const key = asset.toUpperCase();
    const item = tickerData.find((t) => (t.asset ?? "").toUpperCase() === key);
    return item?.askChange ?? "still";
  };
  const assetChange = findChange(selectedSymbol ?? "SOL_USDC");

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`)

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        // console.log("parsed data", parsed)

        if (parsed.price_updates) {
          setTickerData((prev) => {
            const merged: Record<string, Ticker> = {}

            // keep old values (normalize keys to uppercase)
            prev.forEach((t) => {
              const key = (t.asset ?? "").toUpperCase();
              merged[key] = { ...t, asset: key };
            })

            parsed.price_updates.forEach((u: Ticker) => {
              const key = (u.asset ?? "").toUpperCase()
              const newBid = u.buy
              const newAsk = u.ask
              const old = merged[key]

              merged[key] = {
                asset: key,
                buy: newBid,
                ask: newAsk,
                // preserve previous change if price unchanged
                bidChange: old
                  ? newBid > old.buy
                    ? "up"
                    : newBid < old.buy
                      ? "down"
                      : old.bidChange ?? null
                  : null,
                askChange: old
                  ? newAsk > old.ask
                    ? "up"
                    : newAsk < old.ask
                      ? "down"
                      : old.askChange ?? null
                  : null,
              }
              updatePrice(key, { bid: newBid, ask: newAsk });
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

  useEffect(() => {
    setToken(getToken())
    const off = onAuthChange(() => setToken(getToken()))
    return () => off()
  }, [])

  const loggedIn = !!token
  return (
    <Card className="h-full rounded-none border-0">
      <CardHeader className="px-3">
        <div className="flex items-center justify-between gap-2 w-full">
  <DropdownMenu >
      <DropdownMenuTrigger asChild>
          <CardTitle className="cursor-pointer rounded-md border border-border w-full justify-between bg-background px-2 py-4 text-xs md:text-sm flex items-center gap-2">
            <div className="flex gap-2 items-center text-base">
            <Image
              src={getAssetLogo(selectedSymbol ?? "SOL_USDC")}
              width={30}
              height={30}
              alt="ETH" />

            {selectedSymbol}
            </div>
            <div className={`flex gap-2 items-end lg:text-2xl xl:text-lg 2xl:text-2xl ${assetChange ===  "up" ? "text-green-500" : assetChange === "down" ?  "text-red-500" : "text-white"} `}>
              {price?.bid}
            <ArrowDownRight width={15} height={20} color="gray" />
            </div>
            {/* <span className="ml-2 text-xs font-normal text-muted-foreground">({selectedSymbol})</span> */}
          </CardTitle>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-none" align="start" >
        <DropdownMenuLabel>Assets</DropdownMenuLabel>
        <DropdownMenuGroup>
          {/* <DropdownMenuSeparator /> */}
          {ASSET_LIST.map((asset) => (
            <div key={asset.key}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
            key={asset.key}
            onClick={() => {
              setSelectedSymbol(asset.key as Asset);
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
                  </div>
          ))}
        </DropdownMenuGroup>

      </DropdownMenuContent>
    </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-3 flex flex-col justify-between h-full">
        {/* Top quote boxes */}
        <div className="flex-col flex gap-3">

        <div className=" grid grid-cols-2 gap-2">
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
            className={side === "sell" ? "h-10" : "h-10  border-red-600/40 text-red-400 hover:bg-red-700"}
          >
            Sell
          </Button>
          <Button
            type="button"
            aria-pressed={side === "buy"}
            onClick={() => setSide("buy")}
            className={side === "buy" ? "h-10 bg-green-600 text-white hover:bg-green-700" : "h-10"}
            variant={side === "buy" ? "default" : "outline"}
            >
            Buy
          </Button>
        </div>
            </div>

        {/* Controls (no Symbol, no Spread) */}
        <div className="flex flex-col gap-5 py-2">
          <div className="mb-2 flex flex-col gap-2">
            <Label htmlFor="volume" className="font-mono">Quantity</Label>
            <Input
              id="volume"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              inputMode="decimal"
              aria-describedby="vol-help"
              className="border-0 h-12"
            />

          </div>
          <div className="flex flex-col gap-2">
            <Label className="block">Leverage</Label>
          
          </div>
          <div className="text-2xl font-semibold">

         {leverage}
         <span className="text-sm font-light">
         x 

         </span>
          </div>
<Slider defaultValue={[0]} min={1} max={100} step={1}  value={[leverage]} onValueChange={(vals:number[])=> setLeverage(vals[0])} />

        </div>



              <div className="pt-2">
                <Button
                  type="button"
                  className={`w-full h-10 ${confirmClasses}`}
                  
                  disabled={!side || !Number.isFinite(notional) || lots <= 0 || createLoading}
                  // onClick placeholder - wire to your submit action
                  onClick={()=>{
                    if (loggedIn){
                      
                      sendOrder();
                    }else{
                      router.push('/auth/login')
                    }
                  }}
                >
                  {createLoading ? (
                    <>
                    <Spinner/> {" Placing Order"}
                    </>
                  )
                  : confirmLabel}
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
