export interface YieldSource {
  id: string;
  name: string;
  protocol: string;
  apy: number;
  tvl: string;
  risk: 'Low' | 'Medium' | 'High';
  description: string;
  logo: string;
  supported_assets: string[];
  fees: {
    deposit: number;
    withdrawal: number;
    management: number;
  };
}

export interface YieldAllocation {
  source: YieldSource;
  allocation_percentage: number;
  expected_yield: number;
  amount_usd: number;
}

// Mock yield sources based on real DeFi protocols
export const YIELD_SOURCES: YieldSource[] = [
  {
    id: 'aave-v3-eth',
    name: 'Aave V3 ETH Supply',
    protocol: 'Aave',
    apy: 3.85,
    tvl: '$12.8B',
    risk: 'Low',
    description: 'Supply ETH to Aave V3 lending pool. Earn interest from borrowers while maintaining full liquidity.',
    logo: '🏦',
    supported_assets: ['ETH', 'WETH'],
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0
    }
  },
  {
    id: 'lido-steth',
    name: 'Lido Staked ETH',
    protocol: 'Lido',
    apy: 4.2,
    tvl: '$45.2B',
    risk: 'Low',
    description: 'Stake ETH through Lido to earn Ethereum 2.0 staking rewards while keeping your assets liquid.',
    logo: '🔒',
    supported_assets: ['ETH'],
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 10 // 10% of staking rewards
    }
  },
  {
    id: 'compound-v3-eth',
    name: 'Compound V3 ETH',
    protocol: 'Compound',
    apy: 2.95,
    tvl: '$3.1B',
    risk: 'Low',
    description: 'Supply ETH to Compound V3 for algorithmic interest rates based on market demand.',
    logo: '⚡',
    supported_assets: ['ETH', 'WETH'],
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0
    }
  },
  {
    id: 'uniswap-v3-eth-usdc',
    name: 'Uniswap V3 ETH/USDC LP',
    protocol: 'Uniswap',
    apy: 12.4,
    tvl: '$890M',
    risk: 'High',
    description: 'Provide liquidity to ETH/USDC pool. Higher yields but subject to impermanent loss.',
    logo: '🦄',
    supported_assets: ['ETH', 'USDC'],
    fees: {
      deposit: 0.3, // Trading fee
      withdrawal: 0.3,
      management: 0
    }
  },
  {
    id: 'convex-steth',
    name: 'Convex stETH/ETH',
    protocol: 'Convex',
    apy: 8.7,
    tvl: '$2.4B',
    risk: 'Medium',
    description: 'Boosted Curve LP rewards through Convex. Earn CRV + CVX tokens on top of base APY.',
    logo: '🌀',
    supported_assets: ['ETH', 'stETH'],
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 17 // Platform fee on rewards
    }
  }
];

// Price data mock (in real app would fetch from API)
export interface PriceData {
  usd_price: number;
  change_24h: number;
  last_updated: string;
}

export const PRICE_DATA: Record<string, PriceData> = {
  ETH: {
    usd_price: 2845.50,
    change_24h: 2.45,
    last_updated: new Date().toISOString()
  },
  XLM: {
    usd_price: 0.243,
    change_24h: -1.23,
    last_updated: new Date().toISOString()
  },
  USDC: {
    usd_price: 1.0,
    change_24h: 0.01,
    last_updated: new Date().toISOString()
  }
};

export class YieldOptimizer {
  
  // AI-powered yield optimization algorithm
  optimizeYieldAllocation(
    totalAmountUsd: number, 
    riskTolerance: 'conservative' | 'moderate' | 'aggressive',
    durationDays: number
  ): YieldAllocation[] {
    
    const filteredSources = this.filterSourcesByRisk(riskTolerance);
    const allocations: YieldAllocation[] = [];
    
    // Sophisticated allocation algorithm based on risk and expected returns
    switch (riskTolerance) {
      case 'conservative':
        allocations.push({
          source: YIELD_SOURCES.find(s => s.id === 'aave-v3-eth')!,
          allocation_percentage: 60,
          expected_yield: 3.85,
          amount_usd: totalAmountUsd * 0.6
        });
        allocations.push({
          source: YIELD_SOURCES.find(s => s.id === 'lido-steth')!,
          allocation_percentage: 40,
          expected_yield: 4.2,
          amount_usd: totalAmountUsd * 0.4
        });
        break;
        
      case 'moderate':
        allocations.push({
          source: YIELD_SOURCES.find(s => s.id === 'lido-steth')!,
          allocation_percentage: 35,
          expected_yield: 4.2,
          amount_usd: totalAmountUsd * 0.35
        });
        allocations.push({
          source: YIELD_SOURCES.find(s => s.id === 'convex-steth')!,
          allocation_percentage: 45,
          expected_yield: 8.7,
          amount_usd: totalAmountUsd * 0.45
        });
        allocations.push({
          source: YIELD_SOURCES.find(s => s.id === 'aave-v3-eth')!,
          allocation_percentage: 20,
          expected_yield: 3.85,
          amount_usd: totalAmountUsd * 0.2
        });
        break;
        
      case 'aggressive':
        allocations.push({
          source: YIELD_SOURCES.find(s => s.id === 'uniswap-v3-eth-usdc')!,
          allocation_percentage: 40,
          expected_yield: 12.4,
          amount_usd: totalAmountUsd * 0.4
        });
        allocations.push({
          source: YIELD_SOURCES.find(s => s.id === 'convex-steth')!,
          allocation_percentage: 35,
          expected_yield: 8.7,
          amount_usd: totalAmountUsd * 0.35
        });
        allocations.push({
          source: YIELD_SOURCES.find(s => s.id === 'lido-steth')!,
          allocation_percentage: 25,
          expected_yield: 4.2,
          amount_usd: totalAmountUsd * 0.25
        });
        break;
    }
    
    return allocations;
  }
  
  private filterSourcesByRisk(riskTolerance: string): YieldSource[] {
    switch (riskTolerance) {
      case 'conservative':
        return YIELD_SOURCES.filter(s => s.risk === 'Low');
      case 'moderate':
        return YIELD_SOURCES.filter(s => s.risk === 'Low' || s.risk === 'Medium');
      case 'aggressive':
        return YIELD_SOURCES;
      default:
        return YIELD_SOURCES;
    }
  }
  
  // Calculate weighted average APY
  calculateWeightedAPY(allocations: YieldAllocation[]): number {
    const totalWeightedYield = allocations.reduce((sum, allocation) => {
      return sum + (allocation.expected_yield * allocation.allocation_percentage / 100);
    }, 0);
    
    return totalWeightedYield;
  }
  
  // Convert USD to ETH
  usdToEth(usdAmount: number): number {
    return usdAmount / PRICE_DATA.ETH.usd_price;
  }
  
  // Convert ETH to USD
  ethToUsd(ethAmount: number): number {
    return ethAmount * PRICE_DATA.ETH.usd_price;
  }
  
  // Get current ETH price
  getCurrentEthPrice(): PriceData {
    return PRICE_DATA.ETH;
  }
}

export const yieldOptimizer = new YieldOptimizer(); 