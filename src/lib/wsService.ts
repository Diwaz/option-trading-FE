// wsService.ts
import { useEffect } from "react";
import { useAssetStore } from "@/store/useStore";

export function useMarketDataWS() {
  const updatePrice = useAssetStore((s) => s.updatePrice);

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      updatePrice(data.symbol , {ask:data.ask,bid:data.bid});
    };
    return () => ws.close();
  }, [updatePrice]);
}
