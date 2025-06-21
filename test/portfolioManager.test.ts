import { simulatePortfolio } from '../src/portfolio/portfolioManager';

const run = async () => {
  const result = await simulatePortfolio('0x123...', 1000, 'aggressive');

  console.log('📊 Portfolio Simulation Result:');
  console.log(`User: ${result.user}`);
  console.log(`Strategy: ${result.strategy}`);
  console.log(`Initial Investment: $${result.initialInvestment}`);
  console.log(`Allocation:`, result.allocation);
  console.log(`Projected 1-Year Return: $${result.projectedReturn.toFixed(2)}`);
};

run();
