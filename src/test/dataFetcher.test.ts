import { fetchDailyPrices, downsampleWeekly } from "../allocation/dataFetcher";

(async () => {
  const tokens = ["ETH", "stETH", "XLM", "USDT", "USDC"];

  for (const token of tokens) {
    const daily = await fetchDailyPrices(token);
    const weekly = downsampleWeekly(daily);

    console.log(`✅ ${token} | Günlük veri sayısı: ${daily.length}, Haftalık: ${weekly.length}`);
    console.log(`🔹 İlk 3 haftalık veri (${token}):`, weekly.slice(0, 3));
  }
})();
