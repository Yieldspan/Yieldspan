import { fetchUsdtXlmPrices } from './arbitrage/fetchPrices';
import { simulateArbitrage } from './arbitrage/simulateArbitrage';
import { simulatePortfolio, getAllocationByStrategy } from './portfolio/portfolioManager';
import { rebalancePortfolio } from './strategies/rebalancer';

const run = async () => {
  const userAddress = '0x123...abcd';
  const investment = 1000;
  const strategy = 'conservative' as const;

  console.log(`👋 User connected: ${userAddress}`);
  console.log(`💸 Investment: $${investment} | Strategy: ${strategy}`);

  const portfolio = await simulatePortfolio(userAddress, investment, strategy);
  console.log('\n📊 Initial Portfolio Allocation:');
  console.log(portfolio.allocation);

  // Arbitraj
  const prices = await fetchUsdtXlmPrices();
  const arbResult = simulateArbitrage(prices, portfolio.allocation.arbitrage);

  if (arbResult) {
    console.log('\n🚀 Arbitrage Analysis:');
    console.log(`Best Source: ${arbResult.bestSource} ($${arbResult.bestPrice})`);
    console.log(`Worst Source: ${arbResult.worstSource} ($${arbResult.worstPrice})`);
    console.log(`Spread: ${arbResult.spreadPercentage.toFixed(2)}%`);
    console.log(`Simulated Profit: $${arbResult.simulatedProfit.toFixed(2)} (on $${arbResult.baseAmount})`);

  } else {
    console.log('\n🚫 No arbitrage opportunity found.');
  }

  const actualAllocation = {
    stETH: portfolio.allocation.stETH + 30,
    anchor: portfolio.allocation.anchor - 20,
    arbitrage: portfolio.allocation.arbitrage - 10
  };

  const targetAllocation = getAllocationByStrategy(strategy, investment);
  const rebalance = rebalancePortfolio(actualAllocation, targetAllocation);

  console.log('\n♻️ Rebalancing Check:');
  if (rebalance.isBalanced) {
    console.log('✅ Portfolio is already balanced.');
  } else {
    console.log('📋 Rebalancing Actions:');
    for (const action of rebalance.actions) {
      console.log(`- Move $${action.amount} from ${action.from} → ${action.to}`);
    }
  }

  console.log('\n🎯 Projected 1-Year Return:', `$${portfolio.projectedReturn.toFixed(2)}`);
};

run();