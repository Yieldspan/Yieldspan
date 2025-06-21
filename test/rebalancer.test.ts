import { rebalancePortfolio } from '../src/strategies/rebalancer';
import { PortfolioAllocation } from '../src/portfolio/portfolioManager';

const current: PortfolioAllocation = {
  stETH: 550,
  anchor: 200,
  arbitrage: 250
};

const target: PortfolioAllocation = {
  stETH: 500,
  anchor: 300,
  arbitrage: 200
};

const result = rebalancePortfolio(current, target);

console.log('♻️ Rebalancing Result:');
if (result.isBalanced) {
  console.log('✅ Portfolio is already balanced.');
} else {
  console.log('📋 Actions:');
  for (const action of result.actions) {
    console.log(`- Move $${action.amount} from ${action.from} → ${action.to}`);
  }
}
