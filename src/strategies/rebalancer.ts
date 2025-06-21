import { PortfolioAllocation } from '../portfolio/portfolioManager';

interface RebalanceAction {
  from: keyof PortfolioAllocation;
  to: keyof PortfolioAllocation;
  amount: number;
}

interface RebalanceResult {
  actions: RebalanceAction[];
  isBalanced: boolean;
}

export const rebalancePortfolio = (
  current: PortfolioAllocation,
  target: PortfolioAllocation,
  tolerance: number = 0.01
): RebalanceResult => {
  const actions: RebalanceAction[] = [];

  const diffs: { [key in keyof PortfolioAllocation]: number } = {
    stETH: current.stETH - target.stETH,
    anchor: current.anchor - target.anchor,
    arbitrage: current.arbitrage - target.arbitrage
  };

  const over = Object.entries(diffs).filter(([_, v]) => v > tolerance);
  const under = Object.entries(diffs).filter(([_, v]) => v < -tolerance);

  for (const [fromKey, fromVal] of over) {
    for (const [toKey, toVal] of under) {
      const amount = Math.min(fromVal, -toVal);
      if (amount > tolerance) {
        actions.push({
          from: fromKey as keyof PortfolioAllocation,
          to: toKey as keyof PortfolioAllocation,
          amount: parseFloat(amount.toFixed(2))
        });

        diffs[fromKey as keyof PortfolioAllocation] -= amount;
        diffs[toKey as keyof PortfolioAllocation] += amount;
      }
    }
  }

  return {
    actions,
    isBalanced: actions.length === 0
  };
};
