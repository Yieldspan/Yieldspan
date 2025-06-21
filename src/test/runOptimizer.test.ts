import {
    fetchDailyPrices,
    downsampleWeekly,
  } from "../allocation/dataFetcher";
  import {
    computeAllReturns,
    calculateCovarianceMatrix,
    calculateExpectedReturns,
  } from "../allocation/analytics";
  import { optimizePortfolio } from "../allocation/optimizer";
  import { formatAllocations } from "../allocation/allocator";
  
  (async () => {
    const tokens = ["ETH", "stETH", "XLM", "USDT", "USDC"];
    const priceData: Record<string, any> = {};
  
    for (const token of tokens) {
      const daily = await fetchDailyPrices(token);
      priceData[token] = downsampleWeekly(daily);
    }
  
    const returns = computeAllReturns(priceData);
    const covMatrix = calculateCovarianceMatrix(returns);
    const expectedReturns = calculateExpectedReturns(returns);
  
    const weights = optimizePortfolio(expectedReturns, covMatrix);
    const allocation = formatAllocations(tokens, weights);
  
    console.log("✅ Optimal Allocation:");
    console.table(allocation);
  })();
  