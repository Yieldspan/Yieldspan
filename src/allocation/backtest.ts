import { calculateLogReturns } from './analytics';
import { PricePoint } from './dataFetcher';

/**
 * Simple rolling Sharpe Ratio backtest.
 * @param priceData Historical price data (token -> price array)
 * @param windowSize Rolling window size (e.g., 4 = 4 weeks)
 */
export function backtestSharpeRatios(
  priceData: Record<string, number[]>,
  windowSize = 4
): Record<string, number[]> {
  const result: Record<string, number[]> = {};

  for (const token in priceData) {
    const prices = priceData[token];
    const pricePoints: PricePoint[] = prices.map((price, i) => ({
      timestamp: i,
      date: i.toString(), // dummy date to satisfy type
      price
    }));

    const tokenReturns = calculateLogReturns(pricePoints);
    const sharpeHistory: number[] = [];

    for (let i = 0; i <= tokenReturns.length - windowSize; i++) {
      const window = tokenReturns.slice(i, i + windowSize);
      const avgReturn =
        window.reduce((sum: number, r: number) => sum + r, 0) / window.length || 0;

      const stdDev = Math.sqrt(
        window.reduce((sum: number, r: number) => sum + Math.pow(r - avgReturn, 2), 0) / window.length
      );

      const sharpe = stdDev !== 0 ? avgReturn / stdDev : 0;
      sharpeHistory.push(Number(sharpe.toFixed(4)));
    }

    result[token] = sharpeHistory;
  }

  return result;
}
