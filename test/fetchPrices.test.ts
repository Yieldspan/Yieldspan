import { fetchUsdtXlmPrices } from '../src/arbitrage/fetchPrices';

const run = async () => {
  const prices = await fetchUsdtXlmPrices();
  console.log('🔍 Fetched Prices:', prices);
};

run();
