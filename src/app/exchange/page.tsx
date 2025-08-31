
import TickerList from "@/components/exchange/ticker-list"
import OrderPanel from "@/components/exchange/order-panel"
import ChartPlaceholder from "@/components/exchange/Chart"
import OrderHistory from "@/components/exchange/order-history"

export default function Page() {
  return (
    <main className="flex h-[100dvh] flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <h1 className="text-lg font-semibold text-pretty">Sample Exchange</h1>
        <p className="text-sm text-muted-foreground">Center area is left blank for your chart.</p>
      </header>

      <section className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-[260px_1fr_320px]">
        <aside className="min-h-0">
          {/* <TickerList /> */}
        </aside>

        <section className="min-h-0">
          {/* <ChartPlaceholder /> */}
        </section>

        <aside className="min-h-0">
          <OrderPanel />
        </aside>
        <div className="min-h-0 md:row-start-2 md:col-start-2">
          <OrderHistory />
        </div>
      </section>
    </main>
  )
}
