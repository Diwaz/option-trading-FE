
"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAssetStore, useTradeStore } from "@/store/useStore"

import { Button } from "../ui/button"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import { TicketX } from "lucide-react"
import { useEffect } from "react"
import { ScrollArea } from "../ui/scroll-area"

type Order = {
  orderId: string
  asset: string
  type: "Buy" | "Sell"
  leverage: number,
  margin: number,
}

const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 })

export default function OrderHistory() {

  const openTrades = useTradeStore((state)=>state.openTrades);
  const fetchTrades = useTradeStore((state)=>state.fetchOrders);
  
  const removeTrade = useTradeStore((state)=>state.removeTrade);
  const prices = useAssetStore((state)=>state.livePrices) 
  const closedOrders = [];

    // console.log("open Orders",openTrades)

  useEffect(()=>{
    fetchTrades();
  },[fetchTrades])

  const calculatePnl = (openPrice:string,leverage:number,margin:number,asset:string,type:string): number =>{
      // PnL = cp - sp
      // cp = openPrice * qty
      // sp = prices[selectedSymbol].ask * qty
      // qty = margin * leverage / openPrice
      const openPriceNumber = parseFloat(openPrice);
      const quantity = margin*leverage / openPriceNumber
      if(type==="buy"){
        const sellingPrice = (prices[asset] ? prices[asset].ask : 160) * quantity;
        const costPrice = openPriceNumber * quantity;
      const pnl = sellingPrice-costPrice;
      return pnl;
      }else{
        const cp = openPriceNumber * quantity;
        const sp =(prices[asset] ?  prices[asset].bid : 130) * quantity;
        const pnl = cp - sp;
        return pnl;
        // pnl = cost price - sell price
        //  cp = openPrice *qty
        //  sp = livePrice.bid
        // live.buy - open price
      }


  }
  const handleCloseOrder = async (id: string) => {
    try {
        const res = await apiRequest('/trade/close','POST',{
            orderId: id
        })

        console.log("Close order response:", res);
        toast(res.message)
        
        removeTrade(id);
    } catch (err) {
      console.error("Close order failed:", err)
      toast("Error while closing order")
    }
  }
  return (
    <Card className="h-full bg-neutral-900 text-neutral-200 w-full rounded-none">

      <CardContent className="p-0">
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="h-10 bg-neutral-900 px-3 py-0  rounded-none">
            <TabsTrigger value="open" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
              Open Positions {"("}
              {openTrades.length}
              {")"}
            </TabsTrigger>
            <TabsTrigger value="closed" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
              Closed Trades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="m-0">
            <div className="overflow-scroll h-[360px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px]">Symbol</TableHead>
                    <TableHead className="w-[72px] text-center ">Side</TableHead>
                    <TableHead className="w-[80px] text-right">Qty</TableHead>
                    <TableHead className="w-[80px] text-right">Leverage</TableHead>
                    <TableHead className="w-[240px] text-center">Opening Price</TableHead>
                    {/* <TableHead className="w-[120px] text-right">TP</TableHead>
                    <TableHead className="w-[120px] text-right">SL</TableHead> */}
                    <TableHead className="w-[220px] text-center">Mark Price</TableHead>
                    <TableHead className="w-[220px]">PnL{"(ROE %)"}</TableHead>
                    <TableHead className="w-[220px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody >
                  {openTrades.map((o) => {
                    const pnl = calculatePnl(o.openingPrice,o.leverage,o.margin,o.asset,o.type)
                    return (
                      <TableRow key={o.orderId} className="hover:bg-neutral-800/50">
                      <TableCell className="font-medium">{o.asset}</TableCell>
                      <TableCell className={o.type === "buy" ? "text-[#1FB658] bg-[#153A31] flex items-center justify-center m-2 max-w-20 rounded-sm" : "text-[#CB3B3D] bg-[#3E1F2A] flex items-center justify-center m-2 max-w-20 rounded-sm"}>{(o.type).toUpperCase()}</TableCell>
                      <TableCell className="text-right">{(o.margin*o.leverage/parseFloat(o.openingPrice)).toPrecision(2)}</TableCell>
                      <TableCell className="text-[#1FB658] flex justify-end ">1:{o.leverage}</TableCell>
                      <TableCell className="text-center">$ {fmt(parseFloat(o.openingPrice))}</TableCell>
                      <TableCell className="text-center">$ {fmt(o.margin)}</TableCell>
                      {/* <TableCell className="text-right">{o.margin ? fmt(o.margin) : "-"}</TableCell>
                      <TableCell className="text-right">{o.margin ? fmt(o.margin) : "-"}</TableCell> */}
                      {/* <TableCell>{prices[o.asset] ? prices[o.asset].ask : "-"  }</TableCell> */}
                      <TableCell
                      className={pnl > 0 ? "text-green-400" : "text-red-500"}
                      >{pnl.toFixed(2)}
                      <div>

                      {"("} {((pnl / o.margin)*100).toFixed(2)} {"%) "}
                      </div>
                      </TableCell>
                      <TableCell className="">
                        <Button size="sm" variant="ghost" className="text-[#CB3B3D] border-[#3E1F2A] border  flex items-center justify-center m-2 rounded-sm" onClick={()=>{handleCloseOrder(o.orderId)}}>
                          Close
                          {/* <TicketX/> */}
                        </Button>
                      </TableCell>
                    </TableRow>
                    )})}
                  {openTrades.length === 0 && (
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
                  {/* {closedOrders.map((o) => (
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
                  ))} */}
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
