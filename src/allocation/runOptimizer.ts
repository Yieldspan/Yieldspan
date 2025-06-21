import { fetchHistoricalPrices } from './dataFetcher';
import { computeAllReturns, calculateExpectedReturns, calculateCovarianceMatrix } from './analytics';
import { optimizePortfolio } from './optimizer';

async function main() {
  const priceData = await fetchHistoricalPrices();

  const returnsMap = computeAllReturns(priceData);
  const expectedReturns = calculateExpectedReturns(returnsMap);
  const covarianceMatrix = calculateCovarianceMatrix(returnsMap);

  const optimalWeights = optimizePortfolio(expectedReturns, covarianceMatrix);

  const tokens = Object.keys(priceData);

  const result: Record<string, number> = {};
  tokens.forEach((token, i) => {
    result[token] = Number(optimalWeights[i].toFixed(4));
  });

  console.log("📊 Optimal Allocation:");
  console.table(result);
}

main();
