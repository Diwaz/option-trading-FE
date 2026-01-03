
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAssetStore } from "@/store/useStore"

export type Ticker = {
  asset: string
  buy: number
  ask: number
  bidChange?: "up" | "down" | null
  askChange?: "up" | "down" | null
}
type Props = {
  selectedId?: string
  onSelect?: (symbol: string) => void
}

export default function TickerList({ selectedId, onSelect }: Props) {
  // console.log('state Data', data)
  const selectedSymbol = useAssetStore((state) => state.selectedSymbol);
  const [data, setData] = useState<Ticker[]>([])
  const setSelectedSymbol = useAssetStore((state) => state.setSelectedSymbol);
  const updatePrice = useAssetStore((state) => state.updatePrice);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080")

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        // console.log("parsed data", parsed)

        if (parsed.price_updates) {
          setData((prev) => {
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
        <CardTitle className="text-base">Instruments</CardTitle>
      </CardHeader>

      <CardContent className="flex h-[calc(100%-3rem)] flex-col p-3">
        <ScrollArea className="min-h-0 flex-1 overflow-x-hidden pr-1">
          <ul className="divide-y divide-border/60">
            {data.map((t) => {
              const selected = t.asset === selectedSymbol
              return (
                <li key={t.asset}>
                  <button
                    type="button"

                    onClick={() => {

                      setSelectedSymbol(t.asset)
                    }

                    }
                    aria-pressed={selected}
                    aria-current={selected ? "true" : undefined}
                    data-selected={selected}
                    className={cn(
                      "group grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 rounded-md px-3 py-3 text-left transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected ? "bg-muted" : "hover:bg-muted/50",
                    )}
                  >
                    {/* Symbol */}
                    <span className="min-w-0 truncate text-sm font-medium tracking-wide text-foreground">
                      {t.asset}
                    </span>

                    {/* Bid */}
                    <span
                      className={cn(
                        "whitespace-nowrap text-right text-xs tabular-nums transition-colors duration-500",
                        t.bidChange === "up" && "text-green-500",
                        t.bidChange === "down" && "text-red-500",
                        !t.bidChange && "text-muted-foreground"
                      )}
                    >
                      {t.buy.toFixed(2)}
                    </span>

                    {/* Ask */}
                    <span
                      className={cn(
                        "whitespace-nowrap text-right text-xs tabular-nums transition-colors duration-500",
                        t.askChange === "up" && "text-green-500",
                        t.askChange === "down" && "text-red-500",
                        !t.askChange && "text-muted-foreground"
                      )}
                    >
                      {t.ask.toFixed(2)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card >
  )
}
