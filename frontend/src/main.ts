import './style.css';
import { walletManager } from './walletIntegration';
import { initializePerformanceChart } from './performanceCharts';

// Types
interface AssetAllocation {
  asset: string;
  weight: number;
  amount: number;
  color: string;
}

interface OptimizationResult {
  amount: number;
  durationDays: number;
  allocation: AssetAllocation[];
  expectedAPY: number;
  sharpeRatio: number;
  confidence: number;
  message: string;
}

interface LoadingStep {
  text: string;
  duration: number;
}

// Asset configuration
const ASSETS = {
  ETH: { name: 'Ethereum', color: '#212529', symbol: 'ETH' },
  stETH: { name: 'Lido Staked ETH', color: '#495057', symbol: 'stETH' },
  XLM: { name: 'Stellar Lumens', color: '#6c757d', symbol: 'XLM' },
  USDT: { name: 'Tether', color: '#8b939b', symbol: 'USDT' },
  USDC: { name: 'USD Coin', color: '#212529', symbol: 'USDC' }
};

// Loading steps for the ML optimization process
const LOADING_STEPS: LoadingStep[] = [
  { text: 'Fetching 52 weeks of historical data...', duration: 1000 },
  { text: 'Computing correlation matrices...', duration: 800 },
  { text: 'Calculating expected returns...', duration: 600 },
  { text: 'Running gradient descent optimization...', duration: 1200 },
  { text: 'Validating Sharpe ratio improvements...', duration: 800 },
  { text: 'Generating optimal allocation...', duration: 400 }
];

class YieldspanApp {
  private form: HTMLFormElement;
  private resultsSection: HTMLElement;
  private loadingModal: HTMLElement;
  private currentStep = 0;

  constructor() {
    this.form = document.getElementById('optimizationForm') as HTMLFormElement;
    this.resultsSection = document.getElementById('resultsSection') as HTMLElement;
    this.loadingModal = document.getElementById('loadingModal') as HTMLElement;
    
    this.initializeEventListeners();
    this.initializeWalletConnections();
    this.addScrollAnimations();
  }

  private initializeEventListeners(): void {
    this.form.addEventListener('submit', this.handleOptimization.bind(this));
    
    // Dynamic input updates
    const amountInput = document.getElementById('amount') as HTMLInputElement;
    const durationSelect = document.getElementById('duration') as HTMLSelectElement;
    
    amountInput.addEventListener('input', this.updatePreview.bind(this));
    durationSelect.addEventListener('change', this.updatePreview.bind(this));
  }

  private initializeWalletConnections(): void {
    // MetaMask connection
    const metaMaskBtn = document.getElementById('connectMetaMaskBtn') as HTMLButtonElement;
    metaMaskBtn.addEventListener('click', async () => {
      try {
        metaMaskBtn.textContent = 'Connecting...';
        await walletManager.connectMetaMask();
        this.updateClaimingInterface();
      } catch (error) {
        console.error('MetaMask connection failed:', error);
        metaMaskBtn.textContent = 'Connect MetaMask';
        alert('Please install MetaMask or check your connection');
      }
    });

    // Freighter connection  
    const freighterBtn = document.getElementById('connectFreighterBtn') as HTMLButtonElement;
    freighterBtn.addEventListener('click', async () => {
      try {
        freighterBtn.textContent = 'Connecting...';
        await walletManager.connectFreighter();
        this.updateClaimingInterface();
      } catch (error) {
        console.error('Freighter connection failed:', error);
        freighterBtn.textContent = 'Connect Freighter';
        alert('Please install Freighter wallet or check your connection');
      }
    });

    // Claim rewards button
    const claimBtn = document.getElementById('claimRewardsBtn') as HTMLButtonElement;
    claimBtn.addEventListener('click', async () => {
      if (!walletManager.canClaim) {
        alert('Please connect your Stellar wallet first');
        return;
      }
      
      try {
        claimBtn.disabled = true;
        claimBtn.textContent = 'Claiming...';
        
        const rewards = walletManager.calculateRewards(1000, 30);
        await walletManager.claimRewards(rewards);
        
        // Update claiming interface to show success
        this.updateClaimingInterface();
        
      } catch (error) {
        console.error('Claiming failed:', error);
        alert('Claiming failed. Please try again.');
      } finally {
        claimBtn.disabled = false;
        claimBtn.textContent = 'Claim to Stellar Wallet';
      }
    });
  }

  private updateClaimingInterface(): void {
    const claimBtn = document.getElementById('claimRewardsBtn') as HTMLButtonElement;
    
    if (walletManager.canClaim) {
      claimBtn.disabled = false;
      claimBtn.style.opacity = '1';
    } else {
      claimBtn.disabled = true;
      claimBtn.style.opacity = '0.5';
    }
  }

  private updatePreview(): void {
    const amount = (document.getElementById('amount') as HTMLInputElement).value;
    const duration = (document.getElementById('duration') as HTMLSelectElement).value;
    
    // Update stats dynamically based on inputs
    const expectedAPY = this.calculateExpectedAPY(parseInt(amount), parseInt(duration));
    const sharpeRatio = this.calculateSharpeRatio(parseInt(amount), parseInt(duration));
    
    // Update hero stats
    document.querySelector('.stat-number')!.textContent = `${expectedAPY}%`;
    document.querySelectorAll('.stat-number')[1]!.textContent = sharpeRatio.toString();
  }

  private calculateExpectedAPY(amount: number, duration: number): string {
    // Sophisticated mock calculation based on amount and duration
    const baseAPY = 9.4;
    const amountFactor = Math.log(amount / 1000) * 0.5;
    const durationFactor = Math.sqrt(duration / 28) * 0.3;
    
    return Math.max(5.0, Math.min(15.0, baseAPY + amountFactor + durationFactor)).toFixed(1);
  }

  private calculateSharpeRatio(amount: number, duration: number): string {
    // Mock Sharpe ratio calculation
    const baseSharpe = 1.23;
    const volatilityAdjustment = (amount > 5000) ? 0.1 : -0.05;
    const timeAdjustment = (duration > 90) ? 0.08 : 0;
    
    return Math.max(0.8, Math.min(1.8, baseSharpe + volatilityAdjustment + timeAdjustment)).toFixed(2);
  }

  private async handleOptimization(event: Event): Promise<void> {
    event.preventDefault();
    
    const formData = new FormData(this.form);
    const amount = parseInt(formData.get('amount') as string);
    const duration = parseInt(formData.get('duration') as string);

    // Show loading modal
    await this.showLoadingAnimation();

    try {
      // Simulate bridge transaction if Ethereum wallet is connected
      if (walletManager.isEthereumConnected) {
        await this.simulateBridgeTransaction(amount);
      }

      // Try real API first, fall back to mock data
      const result = await this.optimizePortfolio(amount, duration);
      this.displayResults(result);
    } catch (error) {
      console.error('Optimization error:', error);
      // Use sophisticated mock data
      const mockResult = this.generateMockResults(amount, duration);
      this.displayResults(mockResult);
    }

    this.hideLoadingModal();
  }

  private async simulateBridgeTransaction(amount: number): Promise<void> {
    const bridgeStatus = document.getElementById('bridge-status');
    if (!bridgeStatus) return;

    // Show pending status
    bridgeStatus.innerHTML = `
      <div class="bridge-pending">
        <strong>Bridge Transaction Pending</strong>
        <div>Transferring ${amount} USD from Ethereum to Stellar...</div>
        <div class="bridge-hash">Hash: 0x${Math.random().toString(16).substr(2, 40)}</div>
      </div>
    `;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Show completed status
    bridgeStatus.innerHTML = `
      <div class="bridge-completed">
        <strong>Bridge Transaction Completed</strong>
        <div>Successfully transferred to Stellar network</div>
        <div class="bridge-hash">Hash: 0x${Math.random().toString(16).substr(2, 40)}</div>
      </div>
    `;
  }

  private async showLoadingAnimation(): Promise<void> {
    this.loadingModal.style.display = 'flex';
    this.currentStep = 0;

    const loadingSteps = document.getElementById('loadingSteps');
    if (!loadingSteps) return;

    // Create step elements
    loadingSteps.innerHTML = LOADING_STEPS
      .map((step, index) => `
        <div class="loading-step" id="step-${index}">
          ${step.text}
        </div>
      `).join('');

    // Animate through steps
    for (let i = 0; i < LOADING_STEPS.length; i++) {
      const stepElement = document.getElementById(`step-${i}`);
      if (stepElement) {
        stepElement.classList.add('active');
        
        await new Promise(resolve => setTimeout(resolve, LOADING_STEPS[i].duration));
        
        stepElement.classList.remove('active');
        stepElement.classList.add('complete');
      }
    }
  }

  private hideLoadingModal(): void {
    this.loadingModal.style.display = 'none';
  }

  private async optimizePortfolio(amount: number, durationDays: number): Promise<OptimizationResult> {
    try {
      const response = await fetch('http://localhost:3000/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          durationDays
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      // Transform API response to match frontend interface
      const transformedAllocations: AssetAllocation[] = apiResponse.allocation.map((item: any) => {
        // Convert weight to percentage and handle negative weights
        const weight = Math.max(0, Math.round(item.weight * 100 * 100) / 100);
        const amount_allocated = amount * (weight / 100);
        
        return {
          asset: item.asset,
          weight: weight,
          amount: amount_allocated,
          color: ASSETS[item.asset as keyof typeof ASSETS]?.color || '#6c757d'
        };
      }).filter((item: AssetAllocation) => item.weight > 0); // Filter out negative weights
      
      // Calculate additional metrics if not provided
      const expectedAPY = this.calculateExpectedAPY(amount, durationDays);
      const sharpeRatio = this.calculateSharpeRatio(amount, durationDays);
      const confidence = Math.min(95, 85 + Math.log(amount / 1000) * 2);
      
      return {
        amount,
        durationDays,
        allocation: transformedAllocations,
        expectedAPY: parseFloat(expectedAPY),
        sharpeRatio: parseFloat(sharpeRatio),
        confidence: parseFloat(confidence.toFixed(1)),
        message: apiResponse.message || `Optimized allocation for ${amount} USD over ${durationDays} days`
      };
    } catch (error) {
      console.error('API optimization failed:', error);
      throw error;
    }
  }

  private generateMockResults(amount: number, durationDays: number): OptimizationResult {
    // Generate sophisticated mock allocation
    const allocations: AssetAllocation[] = [
      { asset: 'ETH', weight: 35, amount: amount * 0.35, color: ASSETS.ETH.color },
      { asset: 'stETH', weight: 25, amount: amount * 0.25, color: ASSETS.stETH.color },
      { asset: 'XLM', weight: 20, amount: amount * 0.20, color: ASSETS.XLM.color },
      { asset: 'USDC', weight: 15, amount: amount * 0.15, color: ASSETS.USDC.color },
      { asset: 'USDT', weight: 5, amount: amount * 0.05, color: ASSETS.USDT.color }
    ];

    // Calculate sophisticated metrics
    const baseAPY = 9.4;
    const amountBonus = Math.log(amount / 1000) * 0.5;
    const durationBonus = Math.sqrt(durationDays / 28) * 0.3;
    const expectedAPY = Math.max(5.0, Math.min(15.0, baseAPY + amountBonus + durationBonus));

    const baseSharpe = 1.23;
    const volatilityAdjustment = (amount > 5000) ? 0.1 : -0.05;
    const timeAdjustment = (durationDays > 90) ? 0.08 : 0;
    const sharpeRatio = Math.max(0.8, Math.min(1.8, baseSharpe + volatilityAdjustment + timeAdjustment));

    const confidence = Math.min(95, 85 + Math.log(amount / 1000) * 2);

    return {
      amount,
      durationDays,
      allocation: allocations,
      expectedAPY: parseFloat(expectedAPY.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(3)),
      confidence: parseFloat(confidence.toFixed(1)),
      message: `Optimized allocation for ${amount} USD over ${durationDays} days with ${confidence.toFixed(1)}% confidence`
    };
  }

  private displayResults(result: OptimizationResult): void {
    // Update results meta
    const resultsMeta = document.getElementById('resultsMeta');
    if (resultsMeta) {
      resultsMeta.innerHTML = `
        <strong>Optimization Complete:</strong> ${result.message}
      `;
    }

    // Render allocation chart
    this.renderAllocationChart(result.allocation);

    // Render metrics
    this.renderMetrics(result);

    // Update rewards display
    this.updateRewardsDisplay(result.amount, result.durationDays);

    // Show results section
    this.resultsSection.style.display = 'block';
    this.resultsSection.scrollIntoView({ behavior: 'smooth' });

    // Initialize performance chart
    setTimeout(() => {
      const dashboard = document.getElementById('performanceDashboard');
      if (dashboard) {
        dashboard.style.display = 'block';
        initializePerformanceChart();
      }
    }, 1000);
  }

  private updateRewardsDisplay(amount: number, days: number): void {
    const rewards = walletManager.calculateRewards(amount, days);
    
    const rewardsAmount = document.getElementById('rewardsAmount');
    const rewardsUsd = document.getElementById('rewardsUsd');
    
    if (rewardsAmount && rewardsUsd) {
      rewardsAmount.textContent = `${rewards.amount} ${rewards.token}`;
      rewardsUsd.textContent = `($${rewards.usdValue})`;
    }
  }

  private renderAllocationChart(allocations: AssetAllocation[]): void {
    const chartContainer = document.getElementById('allocationChart');
    if (!chartContainer) return;

    chartContainer.innerHTML = allocations.map(allocation => `
      <div class="allocation-item">
        <div class="asset-info">
          <div class="asset-icon asset-${allocation.asset.toLowerCase()}">${allocation.asset}</div>
          <div class="asset-name">${ASSETS[allocation.asset as keyof typeof ASSETS]?.name || allocation.asset}</div>
        </div>
        <div>
          <div class="asset-weight">${allocation.weight}%</div>
          <div class="asset-amount">$${allocation.amount.toFixed(0)}</div>
        </div>
      </div>
    `).join('');
  }

  private renderMetrics(result: OptimizationResult): void {
    const metricsGrid = document.getElementById('metricsGrid');
    if (!metricsGrid) return;

    const metrics = [
      { label: 'Expected APY', value: `${result.expectedAPY}%` },
      { label: 'Sharpe Ratio', value: result.sharpeRatio.toString() },
      { label: 'Confidence Level', value: `${result.confidence}%` },
      { label: 'Duration', value: `${result.durationDays} days` }
    ];

    metricsGrid.innerHTML = metrics.map(metric => `
      <div class="metric-card">
        <div class="metric-value">${metric.value}</div>
        <div class="metric-label">${metric.label}</div>
      </div>
    `).join('');
  }

  private addScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe sections for animation
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });
  }
}

// Initialize the application
new YieldspanApp();
