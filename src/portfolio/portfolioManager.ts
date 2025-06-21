import { fetchUsdtXlmPrices } from '../arbitrage/fetchPrices';
import { simulateArbitrage } from '../arbitrage/simulateArbitrage';

export type StrategyType = 'conservative' | 'balanced' | 'aggressive';

export interface PortfolioAllocation {
  stETH: number;
  anchor: number;
  arbitrage: number;
}

export interface PortfolioResult {
  user: string;
  strategy: StrategyType;
  initialInvestment: number;
  allocation: PortfolioAllocation;
  projectedReturn: number;
}

export const getAllocationByStrategy = (
  strategy: StrategyType,
  amount: number
): PortfolioAllocation => {
  switch (strategy) {
    case 'conservative':
      return {
        stETH: amount * 0.2,
        anchor: amount * 0.7,
        arbitrage: amount * 0.1
      };
    case 'aggressive':
      return {
        stETH: amount * 0.3,
        anchor: amount * 0.2,
        arbitrage: amount * 0.5
      };
    case 'balanced':
    default:
      return {
        stETH: amount * 0.5,
        anchor: amount * 0.3,
        arbitrage: amount * 0.2
      };
  }
};

export const calculatePortfolioReturn = async (
  allocation: PortfolioAllocation
): Promise<number> => {
  const stETHReturn = allocation.stETH * 0.05;
  const anchorReturn = allocation.anchor * 0.08;

  try {
    const prices = await fetchUsdtXlmPrices();
    const result = simulateArbitrage(prices, allocation.arbitrage);
    const arbitrageReturn = result ? result.simulatedProfit : 0;

    return stETHReturn + anchorReturn + arbitrageReturn;
  } catch (err) {
    console.error('❗ Arbitraj hesaplanamadı, varsayılan %0 uygulanıyor.');
    return stETHReturn + anchorReturn;
  }
};

export const simulatePortfolio = async (
  user: string,
  amount: number,
  strategy: StrategyType = 'balanced'
): Promise<PortfolioResult> => {
  const allocation = getAllocationByStrategy(strategy, amount);
  const projectedReturn = await calculatePortfolioReturn(allocation);

  return {
    user,
    strategy,
    initialInvestment: amount,
    allocation,
    projectedReturn
  };
};
