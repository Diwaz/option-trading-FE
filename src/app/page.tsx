
"use client"

import { useMemo, useState } from "react"
import TickerList, { type Ticker } from "@/components/exchange/ticker-list"
import Chart from "@/components/exchange/Chart"
import OrderPanel from "@/components/exchange/order-panel"
import OrderHistory from "@/components/exchange/order-history"
export default function Page() {

  return (
    <main className="mx-auto w-full max-w-[1440px] p-4">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[280px_minmax(0,1fr)_360px]">
        <section aria-label="Instruments" className="rounded-lg border bg-card text-card-foreground">
          <TickerList />
        </section>

        {/* Center: Chart placeholder (you will replace this) */}
        <section aria-label="Chart" className="rounded-lg border bg-card text-card-foreground">
          <Chart />
        </section>

        {/* Right: Order panel bound to selection */}
        <section aria-label="Order panel" className="rounded-lg border bg-card text-card-foreground">
          <OrderPanel />
        </section>
        <div className="min-h-0 w-full md:col-start-2">
          <OrderHistory />
        </div>
      </div>
    </main>
  )
}
