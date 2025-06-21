import { fetchUsdtXlmPrices } from '../src/arbitrage/fetchPrices';
import { simulateArbitrage } from '../src/arbitrage/simulateArbitrage';

const run = async () => {
  const prices = await fetchUsdtXlmPrices();
  console.log('🔍 Fetched Prices:', prices);

  const result = simulateArbitrage(prices, 200); 

  if (result) {
    console.log('\n✅ Arbitrage Opportunity Found:');
    console.log(`Best Source: ${result.bestSource} (${result.bestPrice})`);
    console.log(`Worst Source: ${result.worstSource} (${result.worstPrice})`);
    console.log(`Spread: ${result.spreadPercentage.toFixed(2)}%`);
    console.log(`Simulated Profit: $${result.simulatedProfit.toFixed(2)} (on $${result.baseAmount})`);
  } else {
    console.log('\n❌ No arbitrage opportunity found.');
  }
};

run();
