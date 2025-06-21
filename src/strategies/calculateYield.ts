type StrategyType = 'conservative' | 'aggressive' | 'balanced';

interface YieldInput {
  investment: number;
  days?: number;
  strategy?: StrategyType;
}

export function calculateYield({ investment, days = 365, strategy = 'balanced' }: YieldInput) {
  // APY değerleri (yıllık bazda)
  const APYs = {
    stETH: 0.05,
    anchor: 0.08,
    arbitrage: 0.12
  };

  // Dağılım stratejisi
  let allocation: { stETH: number; anchor: number; arbitrage: number };

  switch (strategy) {
    case 'conservative':
      allocation = {
        stETH: investment * 0.2,
        anchor: investment * 0.7,
        arbitrage: investment * 0.1
      };
      break;
    case 'aggressive':
      allocation = {
        stETH: investment * 0.3,
        anchor: investment * 0.2,
        arbitrage: investment * 0.5
      };
      break;
    case 'balanced':
    default:
      allocation = {
        stETH: investment * 0.5,
        anchor: investment * 0.3,
        arbitrage: investment * 0.2
      };
      break;
  }

  // Faiz kazançlarını hesapla
  const stETH_yield = allocation.stETH * APYs.stETH * (days / 365);
  const anchor_yield = allocation.anchor * APYs.anchor * (days / 365);
  const arbitrage_yield = allocation.arbitrage * APYs.arbitrage * (days / 365);

  const totalYield = stETH_yield + anchor_yield + arbitrage_yield;
  const totalAPY = (totalYield / investment) * 100;

  return {
    strategy,
    stETH_APY: APYs.stETH * 100,
    anchor_APY: APYs.anchor * 100,
    arbitrage_APY: APYs.arbitrage * 100,
    total_APY: totalAPY,
    estimatedYield: totalYield.toFixed(2)
  };
}
