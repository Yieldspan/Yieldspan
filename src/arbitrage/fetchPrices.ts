import axios from 'axios';

export interface PriceInfo {
  source: string;
  price: number;
  baseToken: string;
  quoteToken: string;
}

export const fetchUsdtXlmPrices = async (): Promise<PriceInfo[]> => {
  try {
    // 1. USDT fiyatı (USD bazlı)
    const usdtResp = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=USDT`
    );

    const usdtPairs = usdtResp.data.pairs.filter((p: any) =>
      (p.baseToken.symbol === 'USDT' && p.quoteToken.symbol === 'USDC') ||
      (p.baseToken.symbol === 'USDC' && p.quoteToken.symbol === 'USDT')
    );

    const usdtPrice = usdtPairs.length > 0 ? parseFloat(usdtPairs[0].priceUsd) : null;

    // 2. XLM fiyatı (USD bazlı) → CoinGecko’dan alınır
    const xlmResp = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd`
    );

    const xlmPrice = xlmResp.data?.stellar?.usd || null;

    if (!usdtPrice || !xlmPrice) {
      console.error("Couldn't fetch prices properly.");
      return [];
    }

    return [
      {
        source: 'dexscreener',
        price: usdtPrice,
        baseToken: 'USDT',
        quoteToken: 'USD'
      },
      {
        source: 'coingecko',
        price: xlmPrice,
        baseToken: 'XLM',
        quoteToken: 'USD'
      }
    ];
  } catch (err) {
    console.error('Error fetching USDT-XLM prices:', err);
    return [];
  }
};
