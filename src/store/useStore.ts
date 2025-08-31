import { create } from "zustand";

type Price = {
  bid: number;
  ask: number;
};

type AssetState = {
  selectedSymbol: string | null;   // only changes when user clicks
  livePrices: Record<string, Price>;
  setSelectedSymbol: (symbol: string) => void;
  updatePrice: (symbol: string, price: Price) => void;
};

export const useAssetStore = create<AssetState>((set) => ({
  selectedSymbol: null,
  livePrices: {},
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  updatePrice: (symbol, price) =>
    set((state) => ({
      livePrices: { ...state.livePrices, [symbol]: price },
    })),
}));
