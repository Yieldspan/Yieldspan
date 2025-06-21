import axios from "axios";

// Tokenlar için Coingecko ID'leri
const tokenMap: Record<string, string> = {
  ETH: "ethereum",
  stETH: "staked-ether",
  XLM: "stellar",
  USDT: "tether",
  USDC: "usd-coin",
};

export interface PricePoint {
  date: string;
  price: number;
}

/**
 * 1 yıllık günlük fiyatları çeker
 */
export async function fetchDailyPrices(tokenSymbol: string): Promise<PricePoint[]> {
  const tokenId = tokenMap[tokenSymbol];
  if (!tokenId) throw new Error(`Unsupported token: ${tokenSymbol}`);

  const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=365&interval=daily`;

  const res = await axios.get(url);
  const prices = res.data.prices as [number, number][]; // [timestamp, price]

  return prices.map(([timestamp, price]) => ({
    date: new Date(timestamp).toISOString().split("T")[0],
    price,
  }));
}

/**
 * Haftalık fiyatlara dönüştürür (her 7 günde bir kapanış)
 */
export function downsampleWeekly(prices: PricePoint[]): PricePoint[] {
  const result: PricePoint[] = [];

  for (let i = 0; i < prices.length; i += 7) {
    result.push(prices[i]); // her 7 günde bir fiyat al
  }

  return result;
}

/**
 * Tüm tokenlar için haftalık fiyat verisini topluca getirir
 */
export async function fetchHistoricalPrices(): Promise<Record<string, PricePoint[]>> {
  const result: Record<string, PricePoint[]> = {};

  for (const token of Object.keys(tokenMap)) {
    const daily = await fetchDailyPrices(token);
    const weekly = downsampleWeekly(daily);
    result[token] = weekly;
  }

  return result;
}
