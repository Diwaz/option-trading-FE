
"use client"

import { useMemo, useState } from "react"
import TickerList, { type Ticker } from "@/components/exchange/ticker-list"
import ChartPlaceholder from "@/components/exchange/Chart"
import OrderPanel from "@/components/exchange/order-panel"
import OrderHistory from "@/components/exchange/order-history"
const TICKERS: Ticker[] = [
  { symbol: "BTCUSD", name: "Bitcoin", bid: 108730.79, ask: 108752.39, changePct: -5.76 },
  { symbol: "ETHUSD", name: "Ethereum", bid: 3850.1, ask: 3851.2, changePct: 2.1 },
  { symbol: "XAUUSD", name: "Gold", bid: 2348.0, ask: 2348.6, changePct: 0.3 },
  { symbol: "EURUSD", name: "Euro / USD", bid: 1.1685, ask: 1.1688, changePct: -0.2 },
  { symbol: "AAPL", name: "Apple", bid: 232.64, ask: 232.91, changePct: 1.1 },
  { symbol: "USDJPY", name: "USD / JPY", bid: 147.03, ask: 147.09, changePct: 0.5 },
  { symbol: "USOIL", name: "Crude Oil", bid: 63.74, ask: 63.82, changePct: -1.0 },
]

export default function Page() {
  const [selectedId, setSelectedId] = useState<string>(TICKERS[0].symbol)
  const selected = useMemo(() => TICKERS.find((t) => t.symbol === selectedId) ?? TICKERS[0], [selectedId])

  return (
    <main className="mx-auto w-full max-w-[1440px] p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_minmax(0,1fr)_360px]">
        {/* Left: Ticker list (no search) */}
        <section aria-label="Instruments" className="rounded-lg border bg-card text-card-foreground">
          <TickerList tickers={TICKERS} selectedId={selectedId} onSelect={setSelectedId} />
        </section>

        {/* Center: Chart placeholder (you will replace this) */}
        <section aria-label="Chart" className="rounded-lg border bg-card text-card-foreground">
          <ChartPlaceholder />
        </section>

        {/* Right: Order panel bound to selection */}
        <section aria-label="Order panel" className="rounded-lg border bg-card text-card-foreground">
          <OrderPanel ticker={selected} />
        </section>
        <div className="min-h-0 w-full md:col-start-2">
          <OrderHistory />
        </div>
      </div>
    </main>
  )
}
