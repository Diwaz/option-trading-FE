"use client"

import { useState, useMemo } from "react"
import TickerList, { type Ticker } from "./ticker-list"
import ChartPlaceholder from "./Chart"
import OrderPanel from "./order-panel"

const DEFAULT_TICKERS: Ticker[] = [
  { id: "BTCUSD", name: "Bitcoin", symbol: "BTC", bid: 108730.79, ask: 108752.39, change: -5.76 },
  { id: "XAUUSD", name: "Gold", symbol: "XAU", bid: 2348.035, ask: 2348.44, change: 0.31 },
  { id: "AAPL", name: "Apple", symbol: "AAPL", bid: 232.64, ask: 232.91, change: 0.12 },
  { id: "EURUSD", name: "Euro / USD", symbol: "EURUSD", bid: 1.16851, ask: 1.16, change: -0.28 },
  { id: "USDJPY", name: "USD / JPY", symbol: "USDJPY", bid: 147.035, ask: 147.12, change: 0.05 },
  { id: "USOIL", name: "US Oil", symbol: "USOIL", bid: 63.741, ask: 63.79, change: 0.21 },
]

export default function ExchangeShell() {
  // Default to first instrument
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_TICKERS[0]?.id)

  const selected = useMemo(() => DEFAULT_TICKERS.find((t) => t.id === selectedId) ?? DEFAULT_TICKERS[0], [selectedId])

  return (
    <main className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 p-4 md:grid-cols-[280px_minmax(0,1fr)_360px]">
      {/* Left: Tickers */}
      <section aria-label="Instruments" className="rounded-lg border bg-card text-card-foreground">
        <TickerList tickers={DEFAULT_TICKERS} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />
      </section>

      {/* Center: Chart placeholder (blank area for your chart) */}
      <section aria-label="Chart" className="rounded-lg border bg-card text-card-foreground">
        <ChartPlaceholder />
      </section>

      {/* Right: Order panel */}
      <section aria-label="Order panel" className="rounded-lg border bg-card text-card-foreground">
        <OrderPanel ticker={selected} />
      </section>
    </main>
  )
}
