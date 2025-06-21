/**
 * Optimize portfolio using Mean-Variance Optimization (MPT)
 * Minimize risk for given return (or maximize Sharpe Ratio without risk-free rate)
 * 
 * @param expectedReturns number[] → beklenen log-getiriler
 * @param covMatrix number[][] → kovaryans matrisi
 * @returns optimal allocation weights (number[])
 */
export function optimizePortfolio(expectedReturns: number[], covMatrix: number[][]): number[] {
    const n = expectedReturns.length;
  
    // Varsayılan: Eşit ağırlıklar ile başla
    let weights = new Array(n).fill(1 / n);
  
    // Gradient descent gibi basit bir optimizasyon (çok daha gelişmiş versiyonlar eklenebilir)
    const learningRate = 0.01;
    const iterations = 500;
  
    for (let iter = 0; iter < iterations; iter++) {
      const grad = gradient(expectedReturns, covMatrix, weights);
      weights = weights.map((w, i) => w + learningRate * grad[i]);
  
      // Normalize weights (toplam = 1)
      const sum = weights.reduce((acc, val) => acc + val, 0);
      weights = weights.map(w => w / sum);
    }
  
    return weights;
  }
  
  /**
   * Objective: maximize Sharpe-like ratio (expected return / volatility)
   * Gradient: ∂(return / sqrt(risk)) / ∂w
   */
  function gradient(returns: number[], cov: number[][], weights: number[]): number[] {
    const n = returns.length;
    const grad: number[] = [];
  
    // Portfolio return
    const portReturn = dot(weights, returns);
  
    // Portfolio variance
    const portVar = dot(weights, matrixVectorProduct(cov, weights));
    const portStd = Math.sqrt(portVar);
  
    for (let i = 0; i < n; i++) {
      const partialReturn = returns[i];
      const partialVar = 2 * dot(cov[i], weights);
  
      // d(R / σ) / dw_i = (σ * dR - R * dσ) / σ^2
      const d = (portStd * partialReturn - portReturn * (partialVar / (2 * portStd))) / (portStd ** 2);
      grad.push(d);
    }
  
    return grad;
  }
  
  function dot(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }
  
  function matrixVectorProduct(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => dot(row, vector));
  }
  