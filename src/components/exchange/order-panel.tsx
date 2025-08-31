"use client"
import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import type { Ticker } from "@/components/exchange/ticker-list"
import { useAssetStore } from "@/store/useStore";
export default function OrderPanel() {
  const [volume, setVolume] = useState("0.50")
  const [tpOn, setTpOn] = useState(false)
  const [slOn, setSlOn] = useState(false)

  const [side, setSide] = useState<"buy" | "sell" | null>(null)
  const leverageStops = [1, 5, 10, 20, 100] as const
  const [leverage, setLeverage] = useState<(typeof leverageStops)[number]>(10)
  const selectedSymbol = useAssetStore((state) => state.selectedSymbol)

 

  // const livePrices = useAssetStore((state) => state.livePrices)


  const price = useAssetStore((state) =>  selectedSymbol ? state.livePrices[selectedSymbol] : null);
  const bid = Number(price?.bid?.toFixed(2) ?? NaN)
  const ask = Number(price?.ask?.toFixed(2) ?? NaN)
  const mid = useMemo(() => {
    const b = Number.isFinite(bid) ? bid : Number.NaN
    const a = Number.isFinite(ask) ? ask : Number.NaN
    return Number.isFinite(b) && Number.isFinite(a) ? (b + a) / 2 : Number.NaN
  }, [bid, ask])

  const lots = Number(volume) || 0
  const contractSize = 100 // demo contract size for UI math
  const notional = Number.isFinite(mid) ? mid * lots * contractSize : 0
  const feeRate = 0.001 // 0.10% example
  const fees = notional * feeRate
  const margin = leverage > 0 ? notional / leverage : 0

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

  return (
    <Card className="h-full">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base text-pretty">
            {selectedSymbol}
            <span className="ml-2 text-xs font-normal text-muted-foreground">({selectedSymbol})</span>
          </CardTitle>
          <Badge
            variant="secondary">
            {/* // className={
            //   ticker.changePct >= 0
            //     ? "border-green-600/20 bg-green-600/10 text-green-400"
            //     : "border-red-600/20 bg-red-600/10 text-red-400"
            // }
          
            {/* {ticker.changePct >= 0 ? "+" : ""}
            // {ticker.changePct}% */} 
          </Badge>
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

        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="mt-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id="tp" checked={tpOn} onCheckedChange={setTpOn} />
                  <Label htmlFor="tp">Take Profit</Label>
                </div>
                <Input placeholder="Price" disabled={!tpOn} className="w-32" inputMode="decimal" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id="sl" checked={slOn} onCheckedChange={setSlOn} />
                  <Label htmlFor="sl">Stop Loss</Label>
                </div>
                <Input placeholder="Price" disabled={!slOn} className="w-32" inputMode="decimal" />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  className={`w-full h-10 ${confirmClasses}`}
                  disabled={!side || !Number.isFinite(notional) || lots <= 0}
                  // onClick placeholder - wire to your submit action
                  onClick={() => {
                    // Submit logic goes here (intentionally left as UI only)
                  }}
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
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-3">
            <div className="space-y-3">
              <div>
                <Label htmlFor="pending-price">Entry price</Label>
                <Input id="pending-price" placeholder="e.g. 108750.00" inputMode="decimal" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="pending-tp">Take Profit</Label>
                  <Input id="pending-tp" placeholder="Optional" inputMode="decimal" />
                </div>
                <div>
                  <Label htmlFor="pending-sl">Stop Loss</Label>
                  <Input id="pending-sl" placeholder="Optional" inputMode="decimal" />
                </div>
              </div>

              {/* Pending flow could also use side + confirm; keeping UI consistent */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  type="button"
                  variant={side === "sell" ? "destructive" : "outline"}
                  onClick={() => setSide("sell")}
                >
                  Select Sell
                </Button>
                <Button
                  type="button"
                  variant={side === "buy" ? "default" : "outline"}
                  onClick={() => setSide("buy")}
                  className={side === "buy" ? "" : "bg-transparent"}
                >
                  Select Buy
                </Button>
              </div>
              <Button type="button" className={`w-full h-10 ${confirmClasses}`} disabled={!side}>
                {confirmLabel}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
