/**
 * Final allocation format:
 * [
 *   { asset: "stETH", weight: 0.32 },
 *   { asset: "XLM", weight: 0.21 },
 *   ...
 * ]
 */

export interface AllocationResult {
    asset: string;
    weight: number;
  }
  
  /**
   * Token isimleri ile oranları eşleştir
   */
  export function formatAllocations(tokens: string[], weights: number[]): AllocationResult[] {
    if (tokens.length !== weights.length) {
      throw new Error("Token list and weight list must be the same length");
    }
  
    return tokens.map((token, i) => ({
      asset: token,
      weight: parseFloat(weights[i].toFixed(4)), // okunabilirlik için 4 basamak
    }));
  }
  