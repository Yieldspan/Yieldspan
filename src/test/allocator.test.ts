import { formatAllocations } from "../allocation/allocator";

// Test verisi: örnek ağırlıklar
const tokens = ["ETH", "stETH", "XLM", "USDT", "USDC"];
const weights = [0.25, 0.30, 0.20, 0.15, 0.10];

(() => {
  try {
    const allocation = formatAllocations(tokens, weights);
    console.log("✅ Allocation formatlama başarılı:");
    console.table(allocation);
  } catch (error) {
    console.error("❌ Hata:", error);
  }
})();
