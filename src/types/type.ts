export type Asset = "ETH_USDC" | "SOL_USDC" | "BTC_USDC"

 export type TradeBody = {
  margin: number;
  leverage: number;
  slippage:number;
  asset: Asset;
  type: "sell" | "buy";
};

export type TradeResponse = {
  orderId: string;
}
export type Order = {
  margin: number,
  leverage:number,
  asset: string,
  type: "buy" | "sell"
  orderId: string
  openingPrice:string;
  slippage:number,
}


export interface OpenOrderResponse {
    message: Order[]
}

export interface ClosedOrder extends Order {
  pnl: number,
  closingPrice: string,
  closedTime: string
}
export interface CloseTradeResponse {
    closedOrders: ClosedOrder[]
}