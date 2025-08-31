import { create } from "zustand";

type Price = {
  bid: number;
  ask: number;
};
type Order = {
  margin: number,
  leverage:number,
  asset: string,
  type: "buy" | "sell"
  orderId: string
}
type AssetState = {
  selectedSymbol: string | null;   // only changes when user clicks
  livePrices: Record<string, Price>;
  setSelectedSymbol: (symbol: string) => void;
  updatePrice: (symbol: string, price: Price) => void;
};
type OrderState = {
  openTrades: Order[],
  addTrade: (trade:Order)=>void;
  removeTrade: (id:string)=> void; 
  clearTrade: ()=> void;
}

export const useAssetStore = create<AssetState>((set) => ({
  selectedSymbol: null,
  livePrices: {},
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  updatePrice: (symbol, price) =>
    set((state) => ({
      livePrices: { ...state.livePrices, [symbol]: price },
    })),
}));

export const useTradeStore = create<OrderState>((set)=>({

  openTrades: [],

  addTrade : (trade) =>
    set((state)=>({
      openTrades: [...state.openTrades,trade]
    })),

  removeTrade: (id) =>
    set((state)=>({
      openTrades: state.openTrades.filter((trade)=>{
      return  trade.orderId !== id;
      }
      )
    })),


  clearTrade:()=>set({
    openTrades: []
  })




}))