

"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  createChart,
  type ISeriesApi,
} from "lightweight-charts";

import { useAssetStore } from "@/store/useStore";

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type Props = {
  asset: string;
  duration: string;
  startTime: string;
  endTime: string;
};

export default function Chart({ asset, duration, startTime, endTime }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [chartReady, setChartReady] = useState(false);

  const selectedSymbol = useAssetStore((state) => state.selectedSymbol);

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      layout: { background: { color: "#0f172a" }, textColor: "#94a3b8" },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      rightPriceScale: { borderColor: "#0b1220" },
      timeScale: { borderColor: "#0b1220" },
      crosshair: { mode: 1 },
      width: ref.current.clientWidth,
      height: ref.current.clientHeight,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    seriesRef.current = series;
    setChartReady(true);

    const onResize = () => {
      chart.applyOptions({
        width: ref.current!.clientWidth,
        height: ref.current!.clientHeight,
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartReady) return;

    async function fetchData() {
      try {
        const token = localStorage.getItem("auth_token"); // adjust key if different
        // const todayDate = new Date().toISOString().split("T")[0];
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          const formatDate = (date) => date.toISOString().split("T")[0];
          const todayDate = formatDate(tomorrow); // e.g. "2025-08-31"

        const res = await fetch(
          `http://localhost:8848/api/v1/candles?assest=${selectedSymbol?.toLowerCase()}usdt&duration=1m&startTime=2025-08-28&endTime=${todayDate}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}` ,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const json = await res.json();

        const candles: Candle[] = json.map((d: any) => ({
          time: Math.floor(new Date(d.bucket).getTime() / 1000), // UNIX seconds
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));

        candles.sort((a, b) => a.time - b.time);

        seriesRef.current?.setData(candles as any);
      } catch (err) {
        console.error("Failed to load chart data:", err);
      }
    }

    fetchData();
  }, [asset, duration, startTime, endTime, chartReady, selectedSymbol]);
  return (
    <div className="w-full h-full relative flex align-center">
      <div className="w-full h-full" ref={ref} />
    </div>
  );
}
