import './style.css';
import { initializeWalletConnections } from './wallet';
import { reactiveUI } from './ui';
import { initializePerformanceChart } from './performanceCharts';
import { bridgeClient } from './bridgeClient';
import { stakingContract } from './contractInterface';
import { yieldOptimizer, YIELD_SOURCES, PRICE_DATA } from './yieldSources';
import { portfolioManager } from './portfolioManager';
import type { YieldAllocation } from './yieldSources';

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
    this.initializeBridgeIntegration();
    this.addScrollAnimations();
    this.initializePriceDisplay();
    this.initializeYieldSourcesDisplay();
  }

  private initializeEventListeners(): void {
    // Preview Strategy Button (NEW FLOW)
    const previewBtn = document.getElementById('previewBtn') as HTMLButtonElement;
    previewBtn.addEventListener('click', this.handlePreviewStrategy.bind(this));
    
    // Back to modify strategy
    const backBtn = document.getElementById('backBtn') as HTMLButtonElement;
    backBtn.addEventListener('click', this.handleBackToForm.bind(this));
    
    // Deposit & Execute Strategy
    const depositBtn = document.getElementById('depositBtn') as HTMLButtonElement;
    depositBtn.addEventListener('click', this.handleDepositAndExecute.bind(this));
    
    // Time simulation controls
    document.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('time-btn')) {
        const days = parseInt((e.target as HTMLElement).getAttribute('data-days') || '0');
        this.simulateTimeElapsed(days);
      }
    });
    
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
        const ethWallet = await walletManager.connectMetaMask();
        
        // Connect to staking contract
        await stakingContract.connect();
        
        // Register with bridge if both wallets are connected
        if (walletManager.isStellarConnected) {
          const stellarWallet = walletManager.getStellarWallet;
          if (stellarWallet) {
            bridgeClient.registerWallets(ethWallet.address, stellarWallet.address);
          }
        }
        
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
        const stellarWallet = await walletManager.connectFreighter();
        
        // Register with bridge if both wallets are connected
        if (walletManager.isEthereumConnected) {
          const ethWallet = walletManager.getEthWallet;
          if (ethWallet) {
            bridgeClient.registerWallets(ethWallet.address, stellarWallet.address);
          }
        }
        
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

  private initializeBridgeIntegration(): void {
    // Bridge connection status
    bridgeClient.on('connected', () => {
      console.log('🔗 Bridge connected');
      this.updateBridgeStatus('connected');
    });

    bridgeClient.on('disconnected', () => {
      console.log('🔌 Bridge disconnected');
      this.updateBridgeStatus('disconnected');
    });

    // Real-time stake events
    bridgeClient.on('stake', (data: any) => {
      console.log('📡 Stake event:', data);
      this.showStakeNotification(data.data.user, data.data.amount);
    });

    // Real-time reward events
    bridgeClient.on('reward', (data: any) => {
      console.log('💰 Reward event:', data);
      this.showRewardNotification(data.data.xlmAmount, data.data.txHash);
      this.updateRewardDisplay(data.data);
    });

    // Balance updates
    bridgeClient.on('balance', (data: any) => {
      console.log('💳 Balance update:', data);
      this.updateBalanceDisplay(data.data.balance, data.data.address);
    });

    // Error handling
    bridgeClient.on('error', (data: any) => {
      console.error('❌ Bridge error:', data);
      this.showErrorNotification(data.data.message);
    });
  }

  private updateClaimingInterface(): void {
    const claimingSection = document.getElementById('claimingSection') as HTMLElement;
    const claimBtn = document.getElementById('claimRewardsBtn') as HTMLButtonElement;
    const rewardsAmount = document.getElementById('rewardsAmount') as HTMLElement;
    const rewardsUsd = document.getElementById('rewardsUsd') as HTMLElement;
    const yieldsBreakdown = document.getElementById('yieldsBreakdown') as HTMLElement;
    
    if (walletManager.isEthereumConnected && claimingSection) {
      const ethWallet = walletManager.getEthWallet;
      if (ethWallet) {
        portfolioManager.setCurrentUser(ethWallet.address);
        const summary = portfolioManager.getPortfolioSummary();
        
        if (summary.pending_claims_xlm > 0) {
          // Show claiming section with real data
          claimingSection.style.display = 'block';
          
          if (rewardsAmount) rewardsAmount.textContent = `${summary.pending_claims_xlm.toFixed(0)} XLM`;
          if (rewardsUsd) rewardsUsd.textContent = `($${summary.total_yield_earned_usd.toFixed(2)})`;
          
          if (yieldsBreakdown) {
            yieldsBreakdown.innerHTML = `
              <div class="yields-detail">
                <p><strong>Total Yield Earned:</strong> $${summary.total_yield_earned_usd.toFixed(2)}</p>
                <p><strong>Positions:</strong> ${summary.number_of_positions} active</p>
                <p><strong>Average APY:</strong> ${summary.average_apy.toFixed(2)}%</p>
              </div>
            `;
          }
          
          if (claimBtn) {
            claimBtn.disabled = false;
            claimBtn.style.opacity = '1';
          }
        } else {
          // Hide claiming section if no rewards
          claimingSection.style.display = 'none';
        }
      }
    }
  }

  private updatePreview(): void {
    const amount = (document.getElementById('amount') as HTMLInputElement).value;
    const duration = (document.getElementById('duration') as HTMLSelectElement).value;
    
    const amountNum = parseInt(amount);
    const durationNum = parseInt(duration);
    
    // Update stats dynamically based on inputs
    const expectedAPY = this.calculateExpectedAPY(amountNum, durationNum);
    const sharpeRatio = this.calculateSharpeRatio(amountNum, durationNum);
    
    // Update hero stats
    document.querySelector('.stat-number')!.textContent = `${expectedAPY}%`;
    document.querySelectorAll('.stat-number')[1]!.textContent = sharpeRatio.toString();
    
    // Update ETH equivalent display
    const ethAmount = yieldOptimizer.usdToEth(amountNum);
    let ethDisplay = document.getElementById('eth-equivalent');
    if (!ethDisplay) {
      ethDisplay = document.createElement('div');
      ethDisplay.id = 'eth-equivalent';
      ethDisplay.className = 'eth-equivalent';
      const amountInput = document.getElementById('amount');
      if (amountInput && amountInput.parentNode) {
        amountInput.parentNode.insertBefore(ethDisplay, amountInput.nextSibling);
      }
    }
    
    ethDisplay.innerHTML = `
      <div class="conversion-display">
        <span class="conversion-label">≈</span>
        <span class="conversion-value">${ethAmount.toFixed(4)} ETH</span>
        <span class="conversion-rate">@ $${PRICE_DATA.ETH.usd_price.toLocaleString()}</span>
      </div>
    `;
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

  // NEW FLOW: Preview strategy before depositing
  private async handlePreviewStrategy(): Promise<void> {
    const formData = new FormData(this.form);
    const amount = parseInt(formData.get('amount') as string);
    const duration = parseInt(formData.get('duration') as string);

    // Generate investment strategy
    const strategy = this.generateInvestmentStrategy(amount, duration);
    
    // Show preview section
    this.displayInvestmentPreview(strategy);
    
         // Hide input section, show preview
     (document.querySelector('.input-section') as HTMLElement).style.display = 'none';
     (document.getElementById('investmentPreviewSection') as HTMLElement).style.display = 'block';
  }

     private handleBackToForm(): void {
     // Show input section, hide preview
     (document.querySelector('.input-section') as HTMLElement).style.display = 'block';
     (document.getElementById('investmentPreviewSection') as HTMLElement).style.display = 'none';
   }

  private async handleDepositAndExecute(): Promise<void> {
    const depositBtn = document.getElementById('depositBtn') as HTMLButtonElement;
    const depositSpinner = document.getElementById('depositSpinner') as HTMLElement;
    
    try {
      // Show loading state
      depositBtn.disabled = true;
      depositBtn.querySelector('.btn-text')!.textContent = 'Executing...';
      depositSpinner.style.display = 'inline-block';

      const formData = new FormData(this.form);
      const amount = parseInt(formData.get('amount') as string);
      const duration = parseInt(formData.get('duration') as string);

      // Execute REAL ETH staking transaction if wallet is connected
      if (walletManager.isEthereumConnected) {
        await this.executeRealStakingTransaction(amount);
      }

      // Create portfolio position
      if (walletManager.isEthereumConnected && walletManager.isStellarConnected) {
        const ethWallet = walletManager.getEthWallet;
        const stellarWallet = walletManager.getStellarWallet;
        
        if (ethWallet && stellarWallet) {
          const strategy = this.generateInvestmentStrategy(amount, duration);
          const position = portfolioManager.createPosition(
            ethWallet.address,
            amount,
            strategy.allocations,
            duration,
            stellarWallet.address
          );
          console.log('Created position:', position);
        }
      }

      // Show transaction results
      this.showTransactionResults(amount, duration);
      
    } catch (error) {
      console.error('Deposit execution error:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      // Reset button state
      depositBtn.disabled = false;
      depositBtn.querySelector('.btn-text')!.textContent = '💰 Deposit & Execute Strategy';
      depositSpinner.style.display = 'none';
    }
  }

  private simulateTimeElapsed(days: number): void {
    // Get current user positions and simulate time
    if (walletManager.isEthereumConnected) {
      const ethWallet = walletManager.getEthWallet;
      if (ethWallet) {
        portfolioManager.setCurrentUser(ethWallet.address);
        portfolioManager.simulateTimeElapsed(days);
        
        // Update UI
        this.updatePositionDisplay();
        this.updateTimeStatus(days);
        this.updateClaimingInterface();
      }
    }
  }

  private async executeRealStakingTransaction(usdAmount: number): Promise<void> {
    const bridgeStatus = document.getElementById('bridge-status');
    if (!bridgeStatus) return;

    try {
      // Step 1: Connect to contract
      bridgeStatus.innerHTML = `
        <div class="bridge-status-container">
          <h3>🌉 REAL Cross-Chain Bridge</h3>
          <div class="bridge-step active">
            <span class="step-icon">🔗</span>
            <div class="step-content">
              <strong>Step 1: Connecting to Contract</strong>
              <div>Initializing ETH staking contract...</div>
            </div>
          </div>
        </div>
      `;

      await stakingContract.connect();

      // Convert USD to ETH using real price data
      const ethAmount = yieldOptimizer.usdToEth(usdAmount);
      
      // Step 2: Execute REAL transaction
      bridgeStatus.innerHTML = `
        <div class="bridge-status-container">
          <h3>🌉 REAL Cross-Chain Bridge</h3>
          <div class="bridge-step completed">
            <span class="step-icon">✅</span>
            <div class="step-content">
              <strong>Step 1: Contract Connected</strong>
              <div>Connected to ${stakingContract.contractAddress}</div>
            </div>
          </div>
          <div class="bridge-step active">
            <span class="step-icon">💰</span>
            <div class="step-content">
              <strong>Step 2: Executing Real ETH Transaction</strong>
              <div>Staking ${ethAmount.toFixed(4)} ETH ($${usdAmount})</div>
              <div>⏳ Please confirm in MetaMask...</div>
            </div>
          </div>
        </div>
      `;

      // Execute REAL staking transaction
      const txHash = await stakingContract.stake(ethAmount);

      // Step 3: Transaction confirmed
      bridgeStatus.innerHTML = `
        <div class="bridge-status-container">
          <h3>🌉 REAL Cross-Chain Bridge</h3>
          <div class="bridge-step completed">
            <span class="step-icon">✅</span>
            <div class="step-content">
              <strong>Step 1: Contract Connected</strong>
              <div>Connected to ${stakingContract.contractAddress}</div>
            </div>
          </div>
          <div class="bridge-step completed">
            <span class="step-icon">✅</span>
            <div class="step-content">
              <strong>Step 2: ETH Transaction Confirmed</strong>
              <div>Staked ${ethAmount.toFixed(4)} ETH successfully!</div>
              <div class="tx-hash">
                TX: <a href="https://sepolia.etherscan.io/tx/${txHash}" target="_blank">${txHash}</a>
              </div>
            </div>
          </div>
          <div class="bridge-step active">
            <span class="step-icon">🌟</span>
            <div class="step-content">
              <strong>Step 3: Waiting for XLM Rewards</strong>
              <div>Bridge server will detect your stake and send XLM rewards...</div>
              <div>Check notifications for real-time updates!</div>
            </div>
          </div>
        </div>
      `;

      console.log('🎉 REAL TRANSACTION COMPLETE:', txHash);

    } catch (error) {
      console.error('❌ Real transaction failed:', error);
      
      bridgeStatus.innerHTML = `
        <div class="bridge-status-container">
          <h3>❌ Transaction Failed</h3>
          <div class="bridge-step error">
            <span class="step-icon">❌</span>
            <div class="step-content">
              <strong>Error: ${error instanceof Error ? error.message : 'Unknown error'}</strong>
              <div>Please check your MetaMask connection and try again</div>
            </div>
          </div>
        </div>
      `;
      
      throw error;
    }
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
    // Use real yield optimizer with risk profile
    const riskTolerance = this.determineRiskTolerance(amount, durationDays);
    const yieldAllocations = yieldOptimizer.optimizeYieldAllocation(amount, riskTolerance, durationDays);
    
    // Convert yield allocations to display format
    const allocations: AssetAllocation[] = yieldAllocations.map(yieldAlloc => ({
      asset: yieldAlloc.source.protocol,
      weight: yieldAlloc.allocation_percentage,
      amount: yieldAlloc.amount_usd,
      color: this.getProtocolColor(yieldAlloc.source.protocol)
    }));

    const expectedAPY = yieldOptimizer.calculateWeightedAPY(yieldAllocations);
    const sharpeRatio = this.calculateSharpeFromAllocations(yieldAllocations);
    const confidence = Math.min(95, 85 + Math.log(amount / 1000) * 2);

    return {
      amount,
      durationDays,
      allocation: allocations,
      expectedAPY: parseFloat(expectedAPY.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(3)),
      confidence: parseFloat(confidence.toFixed(1)),
      message: `AI-optimized ${riskTolerance} allocation across ${yieldAllocations.length} DeFi protocols with ${confidence.toFixed(1)}% confidence`
    };
  }

  private determineRiskTolerance(amount: number, durationDays: number): 'conservative' | 'moderate' | 'aggressive' {
    // Determine risk tolerance based on amount and duration
    if (amount < 5000 || durationDays < 30) {
      return 'conservative';
    } else if (amount < 20000 || durationDays < 90) {
      return 'moderate';
    } else {
      return 'aggressive';
    }
  }

  private getProtocolColor(protocol: string): string {
    const colors: Record<string, string> = {
      'Aave': '#212529',
      'Lido': '#495057',
      'Compound': '#6c757d',
      'Uniswap': '#8b939b',
      'Convex': '#adb5bd'
    };
    return colors[protocol] || '#6c757d';
  }

  private calculateSharpeFromAllocations(allocations: YieldAllocation[]): number {
    // Calculate risk-adjusted returns based on protocol risks
    let totalRisk = 0;
    let totalReturn = 0;
    
    allocations.forEach(alloc => {
      const riskMultiplier = alloc.source.risk === 'Low' ? 0.8 : alloc.source.risk === 'Medium' ? 1.2 : 1.8;
      totalRisk += (alloc.allocation_percentage / 100) * riskMultiplier;
      totalReturn += (alloc.allocation_percentage / 100) * alloc.expected_yield;
    });
    
    return Math.max(0.8, Math.min(2.5, totalReturn / totalRisk / 8)); // Normalize to reasonable Sharpe range
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

  private updateBridgeStatus(status: string): void {
    const statusElement = document.getElementById('bridge-status');
    if (statusElement) {
      statusElement.textContent = `Bridge: ${status}`;
      statusElement.className = `bridge-status ${status}`;
    }
  }

  private showStakeNotification(user: string, amount: number): void {
    const notification = document.createElement('div');
    notification.className = 'notification stake-notification';
    notification.innerHTML = `
      <h4>🚀 New Stake Detected!</h4>
      <p>User: ${user.slice(0, 8)}...</p>
      <p>Amount: ${amount} ETH</p>
      <p>Sending XLM rewards...</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  private showRewardNotification(xlmAmount: number, txHash: string): void {
    const notification = document.createElement('div');
    notification.className = 'notification reward-notification';
    notification.innerHTML = `
      <h4>💰 XLM Reward Sent!</h4>
      <p>Amount: ${xlmAmount} XLM</p>
      <p>TX: ${txHash.slice(0, 12)}...</p>
      <a href="https://stellar.expert/explorer/testnet/tx/${txHash}" target="_blank">View Transaction</a>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 8000);
  }

  private showErrorNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'notification error-notification';
    notification.innerHTML = `
      <h4>❌ Bridge Error</h4>
      <p>${message}</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  private updateRewardDisplay(data: any): void {
    const rewardSection = document.getElementById('reward-info');
    if (rewardSection) {
      rewardSection.innerHTML = `
        <h3>Latest Reward</h3>
        <p>XLM Amount: ${data.xlmAmount}</p>
        <p>To: ${data.stellarAddress}</p>
        <p>TX Hash: ${data.txHash}</p>
      `;
    }
  }

  private updateBalanceDisplay(balance: string, address: string): void {
    const balanceSection = document.getElementById('balance-info');
    if (balanceSection) {
      balanceSection.innerHTML = `
        <h3>Stellar Balance</h3>
        <p>Address: ${address.slice(0, 8)}...</p>
        <p>Balance: ${balance} XLM</p>
      `;
    }
  }

  private initializePriceDisplay(): void {
    const priceData = yieldOptimizer.getCurrentEthPrice();
    
    // Update price display in the input section
    const priceElement = document.createElement('div');
    priceElement.id = 'price-display';
    priceElement.className = 'price-display';
    priceElement.innerHTML = `
      <div class="current-price">
        <span class="price-label">ETH:</span>
        <span class="price-value">$${priceData.usd_price.toLocaleString()}</span>
        <span class="price-change ${priceData.change_24h >= 0 ? 'positive' : 'negative'}">
          ${priceData.change_24h >= 0 ? '+' : ''}${priceData.change_24h.toFixed(2)}%
        </span>
      </div>
    `;
    
    // Insert after the form
    const form = document.getElementById('optimizationForm');
    if (form && form.parentNode) {
      form.parentNode.insertBefore(priceElement, form.nextSibling);
    }
  }

  private initializeYieldSourcesDisplay(): void {
    // Create yield sources section
    const yieldSection = document.createElement('div');
    yieldSection.id = 'yield-sources-section';
    yieldSection.className = 'yield-sources-section';
    yieldSection.innerHTML = `
      <div class="container">
        <h2 class="section-title">Available Yield Sources</h2>
        <p class="section-subtitle">Our AI optimizes across these DeFi protocols to maximize your returns</p>
        <div class="yield-sources-grid" id="yieldSourcesGrid">
          ${YIELD_SOURCES.map(source => `
            <div class="yield-source-card" data-risk="${source.risk.toLowerCase()}">
              <div class="yield-source-header">
                <div class="source-logo">${source.logo}</div>
                <div class="source-info">
                  <h3 class="source-name">${source.name}</h3>
                  <div class="source-protocol">${source.protocol}</div>
                </div>
                <div class="source-apy">
                  <div class="apy-value">${source.apy}%</div>
                  <div class="apy-label">APY</div>
                </div>
              </div>
              <div class="yield-source-body">
                <p class="source-description">${source.description}</p>
                <div class="source-metrics">
                  <div class="metric">
                    <span class="metric-label">TVL:</span>
                    <span class="metric-value">${source.tvl}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Risk:</span>
                    <span class="metric-value risk-${source.risk.toLowerCase()}">${source.risk}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Assets:</span>
                    <span class="metric-value">${source.supported_assets.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
         // Insert after input section
     const inputSection = document.querySelector('.input-section');
     if (inputSection && inputSection.parentNode) {
       inputSection.parentNode.insertBefore(yieldSection, inputSection.nextSibling);
     }
   }

   // NEW METHODS FOR INVESTMENT FLOW
   private generateInvestmentStrategy(amount: number, durationDays: number): {
     allocations: YieldAllocation[],
     expectedReturn: number,
     totalYield: number,
     riskLevel: string
   } {
     const riskTolerance = this.determineRiskTolerance(amount, durationDays);
     const allocations = yieldOptimizer.optimizeYieldAllocation(amount, riskTolerance, durationDays);
     const expectedAPY = yieldOptimizer.calculateWeightedAPY(allocations);
     const totalYield = (amount * expectedAPY / 100) * (durationDays / 365);

     return {
       allocations,
       expectedReturn: expectedAPY,
       totalYield,
       riskLevel: riskTolerance
     };
   }

   private displayInvestmentPreview(strategy: any): void {
     const previewMeta = document.getElementById('previewMeta');
     const allocationPreview = document.getElementById('allocationPreview');
     const returnsSummary = document.getElementById('returnsSummary');

     if (previewMeta) {
       previewMeta.innerHTML = `
         <p class="risk-level">Risk Level: <span class="risk-${strategy.riskLevel}">${strategy.riskLevel.toUpperCase()}</span></p>
         <p class="strategy-desc">Optimized allocation across ${strategy.allocations.length} DeFi protocols</p>
       `;
     }

     if (allocationPreview) {
       allocationPreview.innerHTML = strategy.allocations.map((alloc: any) => `
         <div class="allocation-preview-item">
           <div class="protocol-info">
             <div class="protocol-logo">${alloc.source.logo}</div>
             <div class="protocol-details">
               <h4 class="protocol-name">${alloc.source.name}</h4>
               <p class="protocol-desc">${alloc.source.description}</p>
               <div class="protocol-metrics">
                 <span class="metric-apy">${alloc.source.apy}% APY</span>
                 <span class="metric-tvl">TVL: ${alloc.source.tvl}</span>
                 <span class="metric-risk risk-${alloc.source.risk.toLowerCase()}">${alloc.source.risk} Risk</span>
               </div>
             </div>
           </div>
           <div class="allocation-amount">
             <div class="percentage">${alloc.allocation_percentage}%</div>
             <div class="amount">$${alloc.amount_usd.toFixed(0)}</div>
           </div>
         </div>
       `).join('');
     }

     if (returnsSummary) {
       returnsSummary.innerHTML = `
         <div class="returns-grid">
           <div class="return-item">
             <div class="return-label">Expected APY</div>
             <div class="return-value">${strategy.expectedReturn.toFixed(2)}%</div>
           </div>
           <div class="return-item">
             <div class="return-label">Total Expected Yield</div>
             <div class="return-value">$${strategy.totalYield.toFixed(0)}</div>
           </div>
           <div class="return-item">
             <div class="return-label">Final Amount</div>
             <div class="return-value">$${(strategy.allocations.reduce((sum: number, a: any) => sum + a.amount_usd, 0) + strategy.totalYield).toFixed(0)}</div>
           </div>
         </div>
       `;
     }
   }

   private showTransactionResults(amount: number, duration: number): void {
     // Hide preview, show results
     (document.getElementById('investmentPreviewSection') as HTMLElement).style.display = 'none';
     (document.getElementById('transactionResultsSection') as HTMLElement).style.display = 'block';
     
     this.updatePositionDisplay();
     this.updateTimeStatus(0);
   }

   private updatePositionDisplay(): void {
     const positionSummary = document.getElementById('positionSummary');
     
     if (walletManager.isEthereumConnected && positionSummary) {
       const ethWallet = walletManager.getEthWallet;
       if (ethWallet) {
         portfolioManager.setCurrentUser(ethWallet.address);
         const positions = portfolioManager.getUserPositions();
         
         if (positions.length > 0) {
           const position = positions[0]; // Latest position
           positionSummary.innerHTML = `
             <div class="position-card">
               <div class="position-header">
                 <h4>Position #${position.id.slice(-8)}</h4>
                 <span class="position-status ${position.status}">${position.status.toUpperCase()}</span>
               </div>
               <div class="position-metrics">
                 <div class="metric">
                   <span class="metric-label">Initial Investment:</span>
                   <span class="metric-value">$${position.initial_amount_usd.toFixed(0)}</span>
                 </div>
                 <div class="metric">
                   <span class="metric-label">Current Value:</span>
                   <span class="metric-value">$${position.current_value_usd.toFixed(0)}</span>
                 </div>
                 <div class="metric">
                   <span class="metric-label">Accrued Yield:</span>
                   <span class="metric-value">$${position.accrued_yield_usd.toFixed(2)}</span>
                 </div>
                 <div class="metric">
                   <span class="metric-label">XLM Claimable:</span>
                   <span class="metric-value">${position.accrued_yield_xlm.toFixed(0)} XLM</span>
                 </div>
               </div>
             </div>
           `;
         }
       }
     }
   }

   private updateTimeStatus(elapsedDays: number): void {
     const timeStatus = document.getElementById('timeStatus');
     if (timeStatus) {
       if (elapsedDays === 0) {
         timeStatus.textContent = 'Position started now';
       } else {
         timeStatus.textContent = `${elapsedDays} days have passed`;
       }
     }
     
     // Update claiming interface based on yields
     this.updateClaimingInterface();
   }
}

// Initialize the application
new YieldspanApp();
