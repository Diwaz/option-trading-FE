import { apiRequest } from "@/lib/api-client";
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
  openingPrice:string;
}

interface ClosedOrder extends Order {
  pnl: number,
  closingPrice: string
}
type AssetState = {
  selectedSymbol: string | null;   // only changes when user clicks
  livePrices: Record<string, Price>;
  setSelectedSymbol: (symbol: string) => void;
  updatePrice: (symbol: string, price: Price) => void;
};

 type OrderState = {
  openTrades: Order[],
  closedTrades: ClosedOrder[],
  addTrade: (trade:Order)=>void;
  removeTrade: (id:string)=> void; 
  clearTrade: ()=> void;
  fetchOrders:()=>void;
  loading: boolean;
}

export const useAssetStore = create<AssetState>((set) => ({
  selectedSymbol: "SOL_USDC",
  livePrices: {},
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  updatePrice: (symbol, price) =>
    set((state) => ({
      livePrices: { ...state.livePrices, [symbol]: price },
    })),
}));

export const useTradeStore = create<OrderState>((set)=>({

  openTrades: [],
  closedTrades: [],
  loading:false,

  addTrade : (trade) =>
    set((state)=>({
      openTrades: [...state.openTrades,trade]
    })),

    fetchOrders: async () =>{
      set({
        loading:true
      })
      try {
       const res = await apiRequest('/trade/open',"GET");
       const closeTradeRes = await apiRequest('/trade/closed-orders',"GET");
       const closedTrades = await closeTradeRes.closedOrders as ClosedOrder[];
       const data = await res.message as Order[];
      //  console.log("yaha dai",data)
        set({openTrades:data,loading:false})
        set({closedTrades:closedTrades,loading:false})
      }catch(err){
          console.error('Failed to fetch orders',err)
          set({loading:false})
      }
    },
  removeTrade: (id) =>
    set((state)=>({
      openTrades: state.openTrades.filter((trade)=>{
      return  trade.orderId !== id;
      }
      )
    }))
    ,


  clearTrade:()=>set({
    openTrades: []
  })




}))