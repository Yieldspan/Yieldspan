// src/strategies/strategySelector.ts

export type StrategyType = 'conservative' | 'balanced' | 'aggressive';

interface DecisionInput {
  spreadPercentage: number; 
  volatility?: number;
}

export const selectStrategy = ({ spreadPercentage }: DecisionInput): StrategyType => {
  if (spreadPercentage >= 50) {
    return 'aggressive';
  } else if (spreadPercentage >= 20) {
    return 'balanced';
  } else {
    return 'conservative';
  }
};
