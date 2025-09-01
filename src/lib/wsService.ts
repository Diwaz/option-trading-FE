// wsService.ts
import { useEffect } from "react";
import { useAssetStore } from "@/store/useStore";

export function useMarketDataWS() {
  const updatePrice = useAssetStore((s) => s.updatePrice);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      updatePrice(data.symbol , {ask:data.ask,bid:data.bid});
    };
    return () => ws.close();
  }, [updatePrice]);
}
