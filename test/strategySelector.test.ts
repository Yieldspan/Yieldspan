import { selectStrategy } from '../src/strategies/strategySelector';

const testCases = [
  { spread: 5, expected: 'conservative' },
  { spread: 19.9, expected: 'conservative' },
  { spread: 20, expected: 'balanced' },
  { spread: 35, expected: 'balanced' },
  { spread: 49.99, expected: 'balanced' },
  { spread: 50, expected: 'aggressive' },
  { spread: 75, expected: 'aggressive' },
];

console.log('🔍 Testing Strategy Selection...\n');

testCases.forEach(({ spread, expected }) => {
  const result = selectStrategy({ spreadPercentage: spread });
  const status = result === expected ? '✅' : '❌';
  console.log(`${status} Spread: ${spread}% → Strategy: ${result} (Expected: ${expected})`);
});
