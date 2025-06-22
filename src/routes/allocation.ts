import express, { Request, Response } from "express";
import {
  fetchDailyPrices,
  downsampleWeekly,
} from "../allocation/dataFetcher";
import {
  computeAllReturns,
  calculateCovarianceMatrix,
  calculateExpectedReturns,
} from "../allocation/analytics";
import { optimizePortfolio } from "../allocation/optimizer";
import { formatAllocations } from "../allocation/allocator";

const router = express.Router();

const handleOptimization = async (req: Request, res: Response) => {
  try {
    const { amount, durationDays = 7 } = req.body;

    const tokens = ["ETH", "stETH", "XLM", "USDT", "USDC"];
    const priceData: Record<string, any> = {};

    for (const token of tokens) {
      const daily = await fetchDailyPrices(token);
      priceData[token] = downsampleWeekly(daily);
    }

    const returns = computeAllReturns(priceData);
    const covMatrix = calculateCovarianceMatrix(returns);
    const expectedReturns = calculateExpectedReturns(returns);
    const weights = optimizePortfolio(expectedReturns, covMatrix);
    const allocation = formatAllocations(tokens, weights);

    res.status(200).json({
      amount,
      durationDays,
      allocation,
      message: "✅ Portfolio allocation generated successfully",
    });
  } catch (err) {
    console.error("❌ Allocation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

router.post("/api/allocate", handleOptimization);
router.post("/api/optimize", handleOptimization);

export default router;
