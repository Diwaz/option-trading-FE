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
export type DBClosedOrderSchema = {
  margin: number,
  leverage:number,
  symbol: Asset,
  side: "buy" | "sell"
  orderId: string
  buyPrice:string;
  slippage:number,
  pnl: number,
  closingPrice:string,
  closedTime: string
}

export interface OpenOrderResponse {
    message: Order[]
}

export interface ClosedOrder extends Order {
  pnl: number,
  closingPrice: string,
  closedTime: string
}
export interface ClosedTradesResponse {
    closedOrders: DBClosedOrderSchema[]
}
export interface CloseTradeBody{
    orderId:string
}
export interface CloseTradeResponse {
    message: string
}