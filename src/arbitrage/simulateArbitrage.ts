import { PriceInfo } from './fetchPrices';

export interface ArbitrageResult {
  bestSource: string;
  worstSource: string;
  bestPrice: number;
  worstPrice: number;
  spreadPercentage: number;
  simulatedProfit: number;
  baseAmount: number;
}

export const simulateArbitrage = (
  prices: PriceInfo[],
  baseAmount: number = 100 
): ArbitrageResult | null => {
  if (prices.length < 2) {
    console.warn('❗ Not enough price data to simulate arbitrage.');
    return null;
  }

  const sorted = prices.sort((a, b) => b.price - a.price);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const spread = ((best.price - worst.price) / worst.price) * 100;
  const profit = baseAmount * ((best.price - worst.price) / worst.price);

  return {
    bestSource: best.source,
    worstSource: worst.source,
    bestPrice: best.price,
    worstPrice: worst.price,
    spreadPercentage: spread,
    simulatedProfit: profit,
    baseAmount
  };
};
