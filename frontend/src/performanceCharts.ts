// Performance Charts for Yieldspan Demo

interface ChartDataPoint {
  date: string;
  baseline: number;
  yieldspan: number;
  cumulativeBaseline: number;
  cumulativeYieldspan: number;
}

class PerformanceChart {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.setupCanvas();
  }

  private setupCanvas() {
    // Set high DPI canvas for crisp rendering
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  // Generate mock performance data
  generatePerformanceData(): ChartDataPoint[] {
    const startAmount = 1000;
    let baselineCumulative = startAmount;
    let yieldspanCumulative = startAmount;
    
    const data: ChartDataPoint[] = [];
    
    for (let week = 0; week < 24; week++) {
      // Baseline: Manual DeFi (4-5% APY with volatility)
      const baselineWeekly = 4.0 + (Math.random() - 0.5) * 1.5;
      const baselineGrowth = baselineWeekly / 52; // Weekly growth
      baselineCumulative *= (1 + baselineGrowth / 100);
      
      // Yieldspan: AI-optimized (9-13% APY with ML stabilization)
      const yieldspanWeekly = 11.0 + (Math.random() - 0.5) * 2.0;
      const yieldspanGrowth = yieldspanWeekly / 52; // Weekly growth  
      yieldspanCumulative *= (1 + yieldspanGrowth / 100);
      
      data.push({
        date: `Week ${week + 1}`,
        baseline: baselineWeekly,
        yieldspan: yieldspanWeekly,
        cumulativeBaseline: baselineCumulative,
        cumulativeYieldspan: yieldspanCumulative
      });
    }
    
    return data;
  }

  // Render the main performance comparison chart
  renderChart(data: ChartDataPoint[]) {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Find data ranges
    const maxValue = Math.max(...data.map(d => d.cumulativeYieldspan));
    const minValue = Math.min(...data.map(d => d.cumulativeBaseline));
    
    // Draw grid and axes
    this.drawGrid(padding, chartWidth, chartHeight, minValue, maxValue);
    
    // Draw baseline line (red)
    this.drawLine(
      data.map(d => d.cumulativeBaseline),
      padding,
      chartWidth,
      chartHeight,
      minValue,
      maxValue,
      '#ef4444',
      'Manual DeFi'
    );
    
    // Draw Yieldspan line (green)
    this.drawLine(
      data.map(d => d.cumulativeYieldspan),
      padding,
      chartWidth,
      chartHeight,
      minValue,
      maxValue,
      '#00d4aa',
      'Yieldspan AI'
    );
    
    // Draw legend
    this.drawLegend(width, data[data.length - 1]);
  }

  private drawGrid(padding: number, width: number, height: number, minValue: number, maxValue: number) {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height / 5) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(padding + width, y);
      this.ctx.stroke();
      
      // Y-axis labels
      const value = maxValue - ((maxValue - minValue) / 5) * i;
      this.ctx.fillStyle = '#94A3B8';
      this.ctx.font = '12px Inter';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`$${value.toFixed(0)}`, padding - 10, y + 4);
    }
    
    // Vertical grid lines (every 4 weeks)
    for (let i = 0; i <= 6; i++) {
      const x = padding + (width / 6) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding);
      this.ctx.lineTo(x, padding + height);
      this.ctx.stroke();
      
      // X-axis labels
      this.ctx.fillStyle = '#94A3B8';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${i * 4}w`, x, padding + height + 20);
    }
  }

  private drawLine(
    values: number[],
    padding: number,
    width: number,
    height: number,
    minValue: number,
    maxValue: number,
    color: string,
    label: string
  ) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    
    values.forEach((value, index) => {
      const x = padding + (width / (values.length - 1)) * index;
      const y = padding + height - ((value - minValue) / (maxValue - minValue)) * height;
      
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.stroke();
    
    // Add glow effect
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 8;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }

  private drawLegend(width: number, finalData: ChartDataPoint) {
    const legendY = 30;
    
    // Baseline legend
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(width - 200, legendY - 5, 15, 3);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px Inter';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Manual DeFi', width - 180, legendY);
    this.ctx.font = '12px Inter';
    this.ctx.fillStyle = '#94A3B8';
    this.ctx.fillText(`$${finalData.cumulativeBaseline.toFixed(0)}`, width - 180, legendY + 15);
    
    // Yieldspan legend
    this.ctx.fillStyle = '#00d4aa';
    this.ctx.fillRect(width - 200, legendY + 35, 15, 3);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px Inter';
    this.ctx.fillText('Yieldspan AI', width - 180, legendY + 40);
    this.ctx.font = '12px Inter';
    this.ctx.fillStyle = '#94A3B8';
    this.ctx.fillText(`$${finalData.cumulativeYieldspan.toFixed(0)}`, width - 180, legendY + 55);
    
    // Outperformance
    const outperformance = finalData.cumulativeYieldspan - finalData.cumulativeBaseline;
    this.ctx.fillStyle = '#00d4aa';
    this.ctx.font = 'bold 16px Inter';
    this.ctx.fillText(`+$${outperformance.toFixed(0)} Extra`, width - 180, legendY + 80);
  }
}

// Utility function to create performance summary
function createPerformanceSummary(data: ChartDataPoint[]) {
  const final = data[data.length - 1];
  const initial = 1000;
  
  const baselineReturn = ((final.cumulativeBaseline - initial) / initial) * 100;
  const yieldspanReturn = ((final.cumulativeYieldspan - initial) / initial) * 100;
  const outperformance = yieldspanReturn - baselineReturn;
  const dollarOutperformance = final.cumulativeYieldspan - final.cumulativeBaseline;
  
  return {
    baselineAPY: baselineReturn.toFixed(1),
    yieldspanAPY: yieldspanReturn.toFixed(1),
    outperformancePercent: outperformance.toFixed(1),
    outperformanceDollar: dollarOutperformance.toFixed(0),
    finalBaselineValue: final.cumulativeBaseline.toFixed(0),
    finalYieldspanValue: final.cumulativeYieldspan.toFixed(0)
  };
}

// Create HTML elements for performance dashboard
function createPerformanceDashboard(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="performance-dashboard">
      <div class="performance-header">
        <h3 class="performance-title">📊 Your Performance vs Baseline</h3>
        <div class="performance-timeframe">6 Month Comparison</div>
      </div>
      
      <div class="performance-chart-container">
        <canvas id="performance-chart" width="800" height="400"></canvas>
      </div>
      
      <div class="performance-stats">
        <div class="stat-item baseline-stat">
          <div class="stat-label">Manual DeFi</div>
          <div class="stat-value" id="baseline-apy">4.1%</div>
          <div class="stat-amount" id="baseline-amount">$1,041</div>
        </div>
        
        <div class="stat-item yieldspan-stat">
          <div class="stat-label">Yieldspan AI</div>
          <div class="stat-value" id="yieldspan-apy">11.7%</div>
          <div class="stat-amount" id="yieldspan-amount">$1,117</div>
        </div>
        
        <div class="stat-item outperformance-stat">
          <div class="stat-label">Outperformance</div>
          <div class="stat-value" id="outperformance-percent">+7.6%</div>
          <div class="stat-amount" id="outperformance-dollar">+$76</div>
        </div>
      </div>
      
      <div class="performance-insights">
        <div class="insight-item">
          <span class="insight-icon">🧠</span>
          <span class="insight-text">AI detected 23 rebalancing opportunities</span>
        </div>
        <div class="insight-item">
          <span class="insight-icon">⚡</span>
          <span class="insight-text">Captured 15 arbitrage profits totaling $347</span>
        </div>
        <div class="insight-item">
          <span class="insight-icon">🛡️</span>
          <span class="insight-text">Risk-adjusted returns 2.3x better than manual</span>
        </div>
      </div>
    </div>
  `;
}

// Initialize and render chart
function initializePerformanceChart() {
  // Create dashboard HTML
  createPerformanceDashboard('performance-container');
  
  // Wait for DOM to update
  setTimeout(() => {
    const chart = new PerformanceChart('performance-chart');
    const data = chart.generatePerformanceData();
    const summary = createPerformanceSummary(data);
    
    // Render chart
    chart.renderChart(data);
    
    // Update summary stats
    document.getElementById('baseline-apy')!.textContent = `${summary.baselineAPY}%`;
    document.getElementById('yieldspan-apy')!.textContent = `${summary.yieldspanAPY}%`;
    document.getElementById('outperformance-percent')!.textContent = `+${summary.outperformancePercent}%`;
    document.getElementById('baseline-amount')!.textContent = `$${summary.finalBaselineValue}`;
    document.getElementById('yieldspan-amount')!.textContent = `$${summary.finalYieldspanValue}`;
    document.getElementById('outperformance-dollar')!.textContent = `+$${summary.outperformanceDollar}`;
    
  }, 100);
}

export { PerformanceChart, createPerformanceDashboard, initializePerformanceChart, createPerformanceSummary }; 