
"use client"

import { useMemo } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Order = {
  id: string
  symbol: string
  side: "Buy" | "Sell"
  qty: number
  price: number
  tp?: number | null
  sl?: number | null
  pnl?: number | null
  time: string
}

const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 })

export default function OrderHistory() {
  const { openOrders, closedOrders } = useMemo(() => {
    const open: Order[] = [
      // {
      //   id: "o-1",
      //   symbol: "BTCUSD",
      //   side: "Buy",
      //   qty: 0.5,
      //   price: 108734.12,
      //   tp: 120000,
      //   sl: 102000,
      //   time: "23:14:03",
      // },
      // { id: "o-2", symbol: "AAPL", side: "Sell", qty: 20, price: 232.44, tp: 220, sl: 238, time: "22:02:10" },
    ]
    const closed: Order[] = [
      // { id: "c-1", symbol: "EURUSD", side: "Sell", qty: 1000, price: 1.1685, pnl: 42.3, time: "18:30:51" },
      // { id: "c-2", symbol: "XAUUSD", side: "Buy", qty: 2, price: 2403.5, pnl: -18.5, time: "11:07:22" },
    ]
    return { openOrders: open, closedOrders: closed }
  }, [])

  return (
    <Card className="h-full bg-neutral-900 text-neutral-200 w-full">
      <CardHeader className="py-3 border-b border-neutral-800">
        <CardTitle className="text-sm font-medium">Order History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="h-10 bg-neutral-900 px-3 py-0 border-b border-neutral-800 rounded-none">
            <TabsTrigger value="open" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
              Open
            </TabsTrigger>
            <TabsTrigger value="closed" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
              Closed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="m-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px]">Symbol</TableHead>
                    <TableHead className="w-[72px]">Side</TableHead>
                    <TableHead className="w-[80px] text-right">Qty</TableHead>
                    <TableHead className="w-[120px] text-right">Price</TableHead>
                    <TableHead className="w-[120px] text-right">TP</TableHead>
                    <TableHead className="w-[120px] text-right">SL</TableHead>
                    <TableHead className="w-[100px]">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openOrders.map((o) => (
                    <TableRow key={o.id} className="hover:bg-neutral-800/50">
                      <TableCell className="font-medium">{o.symbol}</TableCell>
                      <TableCell className={o.side === "Buy" ? "text-emerald-400" : "text-red-400"}>{o.side}</TableCell>
                      <TableCell className="text-right">{fmt(o.qty)}</TableCell>
                      <TableCell className="text-right">{fmt(o.price)}</TableCell>
                      <TableCell className="text-right">{o.tp ? fmt(o.tp) : "-"}</TableCell>
                      <TableCell className="text-right">{o.sl ? fmt(o.sl) : "-"}</TableCell>
                      <TableCell>{o.time}</TableCell>
                    </TableRow>
                  ))}
                  {openOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-neutral-400 py-8">
                        No open positions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="closed" className="m-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px]">Symbol</TableHead>
                    <TableHead className="w-[72px]">Side</TableHead>
                    <TableHead className="w-[80px] text-right">Qty</TableHead>
                    <TableHead className="w-[120px] text-right">Price</TableHead>
                    <TableHead className="w-[120px] text-right">PnL</TableHead>
                    <TableHead className="w-[100px]">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closedOrders.map((o) => (
                    <TableRow key={o.id} className="hover:bg-neutral-800/50">
                      <TableCell className="font-medium">{o.symbol}</TableCell>
                      <TableCell className={o.side === "Buy" ? "text-emerald-400" : "text-red-400"}>{o.side}</TableCell>
                      <TableCell className="text-right">{fmt(o.qty)}</TableCell>
                      <TableCell className="text-right">{fmt(o.price)}</TableCell>
                      <TableCell className={`text-right ${o.pnl && o.pnl < 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {o.pnl !== null && o.pnl !== undefined ? fmt(o.pnl) : "-"}
                      </TableCell>
                      <TableCell>{o.time}</TableCell>
                    </TableRow>
                  ))}
                  {closedOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-neutral-400 py-8">
                        No closed orders
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
