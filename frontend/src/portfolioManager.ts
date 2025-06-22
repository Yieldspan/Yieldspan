import type { YieldAllocation, YieldSource } from './yieldSources';
import { PRICE_DATA } from './yieldSources';

export interface PortfolioPosition {
  id: string;
  user_address: string;
  timestamp: string;
  initial_amount_usd: number;
  initial_amount_eth: number;
  eth_price_at_deposit: number;
  allocations: YieldAllocation[];
  duration_days: number;
  status: 'active' | 'matured' | 'withdrawn';
  current_value_usd: number;
  accrued_yield_usd: number;
  accrued_yield_xlm: number;
  stellar_claim_address?: string;
  transactions: PortfolioTransaction[];
}

export interface PortfolioTransaction {
  id: string;
  type: 'deposit' | 'yield_accrual' | 'claim' | 'withdrawal';
  timestamp: string;
  amount_usd: number;
  amount_eth?: number;
  amount_xlm?: number;
  tx_hash?: string;
  blockchain: 'ethereum' | 'stellar';
}

export interface PortfolioSummary {
  total_deposited_usd: number;
  total_current_value_usd: number;
  total_yield_earned_usd: number;
  total_yield_earned_xlm: number;
  number_of_positions: number;
  average_apy: number;
  best_performing_position: PortfolioPosition | null;
  pending_claims_xlm: number;
}

export class PortfolioManager {
  private positions: Map<string, PortfolioPosition> = new Map();
  private currentUser: string | null = null;

  setCurrentUser(address: string): void {
    this.currentUser = address.toLowerCase();
  }

  // Create new position when user deposits
  createPosition(
    userAddress: string,
    amountUsd: number,
    allocations: YieldAllocation[],
    durationDays: number,
    stellarAddress?: string
  ): PortfolioPosition {
    const position: PortfolioPosition = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_address: userAddress.toLowerCase(),
      timestamp: new Date().toISOString(),
      initial_amount_usd: amountUsd,
      initial_amount_eth: amountUsd / PRICE_DATA.ETH.usd_price,
      eth_price_at_deposit: PRICE_DATA.ETH.usd_price,
      allocations,
      duration_days: durationDays,
      status: 'active',
      current_value_usd: amountUsd,
      accrued_yield_usd: 0,
      accrued_yield_xlm: 0,
      stellar_claim_address: stellarAddress,
      transactions: [
        {
          id: `tx_${Date.now()}`,
          type: 'deposit',
          timestamp: new Date().toISOString(),
          amount_usd: amountUsd,
          amount_eth: amountUsd / PRICE_DATA.ETH.usd_price,
          blockchain: 'ethereum'
        }
      ]
    };

    this.positions.set(position.id, position);
    return position;
  }

  // Simulate yield accrual over time
  simulateYieldAccrual(positionId: string, daysElapsed: number): void {
    const position = this.positions.get(positionId);
    if (!position || position.status !== 'active') return;

    // Calculate daily yield for each allocation
    let totalDailyYield = 0;
    position.allocations.forEach(allocation => {
      const dailyYield = (allocation.amount_usd * allocation.expected_yield / 100) / 365;
      totalDailyYield += dailyYield;
    });

    const totalYieldEarned = totalDailyYield * daysElapsed;
    position.accrued_yield_usd = totalYieldEarned;
    position.current_value_usd = position.initial_amount_usd + totalYieldEarned;
    
    // Convert yield to XLM for cross-chain claiming (10x multiplier for demo)
    position.accrued_yield_xlm = totalYieldEarned / PRICE_DATA.XLM.usd_price * 10;

    // Add yield accrual transaction
    position.transactions.push({
      id: `tx_${Date.now()}`,
      type: 'yield_accrual',
      timestamp: new Date().toISOString(),
      amount_usd: totalYieldEarned,
      amount_xlm: position.accrued_yield_xlm,
      blockchain: 'stellar'
    });

    // Mark as matured if duration is complete
    const daysActive = Math.floor((Date.now() - new Date(position.timestamp).getTime()) / (1000 * 60 * 60 * 24));
    if (daysActive >= position.duration_days) {
      position.status = 'matured';
    }

    this.positions.set(positionId, position);
  }

  // Claim XLM rewards on Stellar
  claimRewards(positionId: string, txHash: string): boolean {
    const position = this.positions.get(positionId);
    if (!position || position.accrued_yield_xlm <= 0) return false;

    const claimedAmount = position.accrued_yield_xlm;
    
    // Add claim transaction
    position.transactions.push({
      id: `tx_${Date.now()}`,
      type: 'claim',
      timestamp: new Date().toISOString(),
      amount_xlm: claimedAmount,
      amount_usd: claimedAmount * PRICE_DATA.XLM.usd_price,
      tx_hash: txHash,
      blockchain: 'stellar'
    });

    // Reset accrued XLM (claimed)
    position.accrued_yield_xlm = 0;
    this.positions.set(positionId, position);
    
    return true;
  }

  // Get user's portfolio summary
  getPortfolioSummary(userAddress?: string): PortfolioSummary {
    const user = userAddress?.toLowerCase() || this.currentUser;
    if (!user) throw new Error('No user address provided');

    const userPositions = Array.from(this.positions.values())
      .filter(p => p.user_address === user);

    const summary: PortfolioSummary = {
      total_deposited_usd: 0,
      total_current_value_usd: 0,
      total_yield_earned_usd: 0,
      total_yield_earned_xlm: 0,
      number_of_positions: userPositions.length,
      average_apy: 0,
      best_performing_position: null,
      pending_claims_xlm: 0
    };

    if (userPositions.length === 0) return summary;

    // Calculate totals
    userPositions.forEach(position => {
      summary.total_deposited_usd += position.initial_amount_usd;
      summary.total_current_value_usd += position.current_value_usd;
      summary.total_yield_earned_usd += position.accrued_yield_usd;
      summary.total_yield_earned_xlm += position.accrued_yield_xlm;
      summary.pending_claims_xlm += position.accrued_yield_xlm;
    });

    // Calculate average APY
    let totalWeightedApy = 0;
    userPositions.forEach(position => {
      position.allocations.forEach(allocation => {
        const weight = allocation.amount_usd / summary.total_deposited_usd;
        totalWeightedApy += allocation.expected_yield * weight;
      });
    });
    summary.average_apy = totalWeightedApy;

    // Find best performing position
    summary.best_performing_position = userPositions.reduce((best, current) => {
      const currentReturn = (current.current_value_usd - current.initial_amount_usd) / current.initial_amount_usd;
      const bestReturn = best ? (best.current_value_usd - best.initial_amount_usd) / best.initial_amount_usd : -1;
      return currentReturn > bestReturn ? current : best;
    }, null as PortfolioPosition | null);

    return summary;
  }

  // Get all positions for a user
  getUserPositions(userAddress?: string): PortfolioPosition[] {
    const user = userAddress?.toLowerCase() || this.currentUser;
    if (!user) return [];

    return Array.from(this.positions.values())
      .filter(p => p.user_address === user)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get single position
  getPosition(positionId: string): PortfolioPosition | null {
    return this.positions.get(positionId) || null;
  }

  // Simulate time passing for demo purposes
  simulateTimeElapsed(days: number): void {
    this.positions.forEach((position, id) => {
      if (position.status === 'active') {
        this.simulateYieldAccrual(id, days);
      }
    });
  }

  // Get portfolio performance data for charts
  getPerformanceData(userAddress?: string): any {
    const user = userAddress?.toLowerCase() || this.currentUser;
    if (!user) return null;

    const positions = this.getUserPositions(user);
    if (positions.length === 0) return null;

    // Generate mock historical data
    const dates = [];
    const portfolioValues = [];
    const benchmarkValues = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString());

      // Simulate portfolio growth
      let totalValue = positions.reduce((sum, pos) => sum + pos.initial_amount_usd, 0);
      const growthRate = positions.reduce((sum, pos) => {
        const posApy = pos.allocations.reduce((apy, alloc) => apy + (alloc.expected_yield * alloc.allocation_percentage / 100), 0);
        return sum + (posApy * pos.initial_amount_usd);
      }, 0) / totalValue;

      totalValue *= (1 + (growthRate / 100) * (30 - i) / 365);
      portfolioValues.push(totalValue);

      // Benchmark (traditional savings)
      const benchmarkValue = positions.reduce((sum, pos) => sum + pos.initial_amount_usd, 0) * (1 + 0.02 * (30 - i) / 365);
      benchmarkValues.push(benchmarkValue);
    }

    return {
      dates,
      datasets: [
        {
          label: 'Yieldspan Portfolio',
          data: portfolioValues,
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0, 212, 170, 0.1)',
          fill: true
        },
        {
          label: 'Traditional Savings (2% APY)',
          data: benchmarkValues,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: false
        }
      ]
    };
  }
}

export const portfolioManager = new PortfolioManager(); 