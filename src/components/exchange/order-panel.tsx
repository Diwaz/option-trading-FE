
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import type { Ticker } from "@/components/exchange/ticker-list"

export default function OrderPanel({ ticker }: { ticker: Ticker }) {
  const [volume, setVolume] = useState("0.50")
  const [tpOn, setTpOn] = useState(false)
  const [slOn, setSlOn] = useState(false)

  return (
    <Card className="h-full">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base text-pretty">
            {ticker.name}
            <span className="ml-2 text-xs font-normal text-muted-foreground">({ticker.symbol})</span>
          </CardTitle>
          <Badge
            variant="secondary"
            className={
              ticker.changePct >= 0
                ? "border-green-600/20 bg-green-600/10 text-green-400"
                : "border-red-600/20 bg-red-600/10 text-red-400"
            }
          >
            {ticker.changePct >= 0 ? "+" : ""}
            {ticker.changePct}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        {/* Top quote boxes */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-md border p-3 text-right">
            <div className="text-[11px] text-muted-foreground">Sell</div>
            <div className="text-lg font-semibold tabular-nums text-red-400">{ticker.bid}</div>
          </div>
          <div className="rounded-md border p-3 text-right">
            <div className="text-[11px] text-muted-foreground">Buy</div>
            <div className="text-lg font-semibold tabular-nums text-emerald-400">{ticker.ask}</div>
          </div>
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
          <div className="flex items-end">
            <p className="text-xs text-muted-foreground">TP/SL available below</p>
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

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="destructive" className="h-10">
                  Sell
                </Button>
                <Button className="h-10 bg-emerald-600 text-white hover:bg-emerald-700">Buy</Button>
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

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" className="border-red-600 bg-transparent text-red-500 hover:bg-red-50/10">
                  Place Sell
                </Button>
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700">Place Buy</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
