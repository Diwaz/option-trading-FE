export type AssetRecord = {
  key: string;
  name: string;
  image: string; // public path, e.g. "/btc.png"
};

// canonical list used by UI
export const ASSET_LIST: AssetRecord[] = [
  { key: "BTC_USDC", name: "BTC_USDC", image: "/btc.png" },
  { key: "ETH_USDC", name: "ETH_USDC", image: "/eth.png" },
  { key: "SOL_USDC", name: "SOL_USDC", image: "/sol.png" },
];

export function getAssets(): Record<string, AssetRecord> {
  return ASSET_LIST.reduce((acc, a) => {
    acc[a.key] = a;
    return acc;
  }, {} as Record<string, AssetRecord>);
}

export function getAssetLogo(assetName?: string): string {
  if (!assetName) return "/placeholder.png";
  const key = assetName.toUpperCase();
  const found = ASSET_LIST.find((a) => a.key === key);
  return found?.image ?? "/placeholder.png";
}