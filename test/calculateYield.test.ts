import { calculateYield } from "../src/strategies/calculateYield";

const result = calculateYield({ investment: 1000, strategy: "conservative", days: 365 });

console.log("Strateji:", result.strategy);
console.log("stETH APY:", result.stETH_APY + "%");
console.log("Anchor APY:", result.anchor_APY + "%");
console.log("Arbitraj APY:", result.arbitrage_APY + "%");
console.log("Toplam APY:", result.total_APY.toFixed(2) + "%");
console.log("Kazanç:", result.estimatedYield + " USDC");
