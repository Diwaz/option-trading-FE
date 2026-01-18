"use client"

import { useMemo, useState } from "react"
import Chart from "@/components/exchange/Chart"
import OrderPanel from "@/components/exchange/order-panel"
import OrderHistory from "@/components/exchange/order-history"
import Chat from "@/components/exchange/Chat" 

const timeIntervals = [
  { label: "1m", value: "1m" },
  { label: "3m", value: "3m" },
  { label: "5m", value: "5m" },
  { label: "30m", value: "30m" },
  { label: "1h", value: "1h" },
] as const;

const timeRanges = [
  { label: "1H", value: 60 * 60 * 1000 },
  { label: "1D", value: 24 * 60 * 60 * 1000 },
  { label: "7D", value: 7 * 24 * 60 * 60 * 1000 },
] as const;

type TimeInterval = typeof timeIntervals[number]["value"];
type TimeRange = typeof timeRanges[number]["value"];

export default function Page() {
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>("5m");
  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRanges[1].value);

  const startTime = useMemo(() => {
    const now = new Date().getTime();
    return Math.floor((now - selectedRange) / 1000);
  }, [selectedRange]);

  return (
    <main className="mx-auto w-full h-screen flex flex-col overflow-hidden">
      <div className="grid  lg:grid-cols-[400px_minmax(0,1fr)_400px] flex-1 min-h-0 gap-0">
        
        {/* Chat Component */}
        <section aria-label="Chat" className="border-r bg-card text-card-foreground min-h-0">
          <Chat />
        </section>

        {/* Chart Component */}
        <section aria-label="Chart" className="border-r bg-card text-card-foreground min-h-0">
          <div className="p-2 border-b">
            <div className="flex justify-between">
              <div className="flex ">
                {timeIntervals.map((interval) => (
                  <button
                    key={interval.value}
                    onClick={() => setSelectedInterval(interval.value)}
                    className={`
                      px-3 py-1 rounded text-sm font-medium transition-colors
                      ${selectedInterval === interval.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                      }
                    `}
                  >
                    {interval.label}
                  </button>
                ))}
              </div>
              <div className="flex">
                {timeRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setSelectedRange(range.value)}
                    className={`
                      px-3 py-1 rounded text-sm font-medium transition-colors
                      ${selectedRange === range.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                      }
                    `}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="h-full min-h-0">
            <Chart duration={selectedInterval} startTime={startTime} />
          </div>
        </section>

        {/* Order Panel */}
        <section aria-label="Order panel" className="border-r bg-card text-card-foreground min-h-0">
          <OrderPanel />
        </section>
      </div>

      {/* Row 2: Order History */}
      <div className="w-full h-[360px] flex-none border-t overflow-hidden">
        <OrderHistory />
      </div>
    </main>
  )
}
