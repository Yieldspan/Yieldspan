import { PricePoint } from './dataFetcher';

/**
 * Calculates log returns from a series of prices.
 * Example: log(p1 / p0)
 */
export function calculateLogReturns(prices: PricePoint[]): number[] {
  const returns: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1].price;
    const curr = prices[i].price;
    const logReturn = Math.log(curr / prev);
    returns.push(logReturn);
  }

  return returns;
}

/**
 * Computes log-return series for each token.
 * Input: { ETH: [...], stETH: [...] }
 * Output: { ETH: [...], stETH: [...] }
 */
export function computeAllReturns(priceData: Record<string, PricePoint[]>): Record<string, number[]> {
  const result: Record<string, number[]> = {};

  for (const token in priceData) {
    result[token] = calculateLogReturns(priceData[token]);
  }

  return result;
}

/**
 * Calculates the average return (expected return) for each token.
 */
export function calculateExpectedReturns(returnsMap: Record<string, number[]>): number[] {
  return Object.values(returnsMap).map(returns => average(returns));
}

/**
 * Computes the covariance matrix from the return map.
 */
export function calculateCovarianceMatrix(returnsMap: Record<string, number[]>): number[][] {
  const tokens = Object.keys(returnsMap);
  const n = returnsMap[tokens[0]].length;

  const matrix: number[][] = [];

  for (let i = 0; i < tokens.length; i++) {
    matrix[i] = [];

    for (let j = 0; j < tokens.length; j++) {
      const x = returnsMap[tokens[i]];
      const y = returnsMap[tokens[j]];

      const meanX = average(x);
      const meanY = average(y);

      let cov = 0;
      for (let k = 0; k < n; k++) {
        cov += (x[k] - meanX) * (y[k] - meanY);
      }
      cov /= n - 1;

      matrix[i][j] = cov;
    }
  }

  return matrix;
}

/**
 * Computes the correlation matrix between token returns.
 */
export function calculateCorrelationMatrix(
  returnsMap: Record<string, number[]>
): Record<string, Record<string, number>> {
  const tokens = Object.keys(returnsMap);
  const matrix: Record<string, Record<string, number>> = {};

  for (const tokenA of tokens) {
    matrix[tokenA] = {};
    for (const tokenB of tokens) {
      const returnsA = returnsMap[tokenA];
      const returnsB = returnsMap[tokenB];
      const len = Math.min(returnsA.length, returnsB.length);

      const avgA = average(returnsA.slice(0, len));
      const avgB = average(returnsB.slice(0, len));

      const cov = returnsA
        .slice(0, len)
        .reduce((sum, val, i) => sum + (val - avgA) * (returnsB[i] - avgB), 0) / len;

      const stdA = Math.sqrt(
        returnsA
          .slice(0, len)
          .reduce((sum, val) => sum + Math.pow(val - avgA, 2), 0) / len
      );

      const stdB = Math.sqrt(
        returnsB
          .slice(0, len)
          .reduce((sum, val) => sum + Math.pow(val - avgB, 2), 0) / len
      );

      const corr = stdA && stdB ? cov / (stdA * stdB) : 0;
      matrix[tokenA][tokenB] = Number(corr.toFixed(4));
    }
  }

  return matrix;
}

/**
 * Utility: calculates average of a number array.
 */
function average(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}
