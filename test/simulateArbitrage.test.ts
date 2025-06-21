import { fetchUsdtXlmPrices, fetchEthXlmPrices } from '../src/arbitrage/fetchPrices';
import { simulateArbitrage } from '../src/arbitrage/simulateArbitrage';
import { logArbitrageResult } from '../src/logging/arbitrageLogger';

const run = async () => {
  console.log('🔍 Simulating Arbitrage for USDT-XLM...');
  const usdtXlmPrices = await fetchUsdtXlmPrices();
  console.log('📈 Prices:', usdtXlmPrices);

  const usdtResult = simulateArbitrage(usdtXlmPrices, 200);
  if (usdtResult) {
    console.log('\n✅ USDT-XLM Arbitrage:');
    console.log(`Best: ${usdtResult.bestSource} (${usdtResult.bestPrice})`);
    console.log(`Worst: ${usdtResult.worstSource} (${usdtResult.worstPrice})`);
    console.log(`Spread: ${usdtResult.spreadPercentage.toFixed(2)}%`);
    console.log(`Profit: $${usdtResult.simulatedProfit.toFixed(2)}\n`);

    logArbitrageResult(usdtResult, 'usdt-xlm');
  } else {
    console.log('❌ No USDT-XLM arbitrage opportunity found.\n');
  }

  console.log('🔍 Simulating Arbitrage for ETH-XLM...');
  const ethXlmPrices = await fetchEthXlmPrices();
  console.log('📈 Prices:', ethXlmPrices);

  const ethResult = simulateArbitrage(ethXlmPrices, 200);
  if (ethResult) {
    console.log('\n✅ ETH-XLM Arbitrage:');
    console.log(`Best: ${ethResult.bestSource} (${ethResult.bestPrice})`);
    console.log(`Worst: ${ethResult.worstSource} (${ethResult.worstPrice})`);
    console.log(`Spread: ${ethResult.spreadPercentage.toFixed(2)}%`);
    console.log(`Profit: $${ethResult.simulatedProfit.toFixed(2)}\n`);

    logArbitrageResult(ethResult, 'eth-xlm');
  } else {
    console.log('❌ No ETH-XLM arbitrage opportunity found.');
  }
};

run();
