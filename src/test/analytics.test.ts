import {
    computeAllReturns,
    calculateCovarianceMatrix,
    calculateExpectedReturns,
  } from "../allocation/analytics";
  import {
    fetchDailyPrices,
    downsampleWeekly,
    PricePoint,
  } from "../allocation/dataFetcher";
  
  (async () => {
    const tokens = ["ETH", "stETH", "XLM", "USDT", "USDC"];
    const priceData: Record<string, PricePoint[]> = {};
  
    for (const token of tokens) {
      try {
        const daily = await fetchDailyPrices(token);
        priceData[token] = downsampleWeekly(daily);
      } catch (err) {
        if (err instanceof Error) {
          console.error(`❌ ${token} verisi çekilemedi:`, err.message);
        } else {
          console.error(`❌ ${token} verisi çekilemedi (bilinmeyen hata):`, err);
        }
      }
    }
  
    if (Object.keys(priceData).length < tokens.length) {
      console.warn("⚠️ Tüm tokenlar için veri alınamadı. Rate limit'e takılmış olabilirsin.");
    }
  
    try {
      const returns = computeAllReturns(priceData);
      const covMatrix = calculateCovarianceMatrix(returns);
      const expected = calculateExpectedReturns(returns);
  
      console.log("✅ Expected Returns:", expected.map(r => r.toFixed(4)));
      console.log("🧠 Covariance Matrix:");
      console.table(covMatrix.map(row => row.map(x => x.toFixed(5))));
    } catch (err) {
      if (err instanceof Error) {
        console.error("❌ Analytics test sırasında hata:", err.message);
      } else {
        console.error("❌ Analytics test sırasında bilinmeyen hata:", err);
      }
    }
  })();
  