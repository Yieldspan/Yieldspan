// Wallet Integration for Yieldspan Cross-Chain Demo
import { 
  isConnected, 
  requestAccess, 
  getAddress, 
  getNetwork,
  signTransaction 
} from "@stellar/freighter-api";

interface WalletConnection {
  address: string;
  balance: string;
  connected: boolean;
  network?: string;
}

interface RewardsClaim {
  amount: number;
  token: string;
  usdValue: number;
  lastClaimed: string;
  nextPayout: string;
}

class WalletManager {
  private ethWallet: WalletConnection | null = null;
  private stellarWallet: WalletConnection | null = null;

  // MetaMask Integration
  async connectMetaMask(): Promise<WalletConnection> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found! Please install MetaMask');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });

      // Convert wei to ETH
      const ethBalance = (parseInt(balance, 16) / 1e18).toFixed(4);

      this.ethWallet = {
        address: accounts[0],
        balance: `${ethBalance} ETH`,
        connected: true,
        network: 'Sepolia Testnet'
      };

      this.updateWalletUI('ethereum', this.ethWallet);
      return this.ethWallet;

    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw error;
    }
  }

  // Freighter (Stellar) Integration - Using Official API
  async connectFreighter(): Promise<WalletConnection> {
    try {
      // Check if Freighter is connected using official API
      const connectionCheck = await isConnected();
      
      if (!connectionCheck.isConnected) {
        throw new Error('Freighter not found! Please install Freighter wallet and refresh the page');
      }

      // Request access to user's public key
      const accessResult = await requestAccess();
      
      if (accessResult.error) {
        throw new Error(`Freighter access denied: ${accessResult.error}`);
      }

      // Get network information
      const networkResult = await getNetwork();
      const networkName = networkResult.error ? 'Unknown Network' : networkResult.network;
      
      // Mock XLM balance (in real app, would call Stellar Horizon API)
      const mockXlmBalance = (Math.random() * 1000 + 500).toFixed(2);

      this.stellarWallet = {
        address: accessResult.address,
        balance: `${mockXlmBalance} XLM`,
        connected: true,
        network: networkName
      };

      this.updateWalletUI('stellar', this.stellarWallet);
      return this.stellarWallet;

    } catch (error) {
      console.error('Freighter connection error:', error);
      throw error;
    }
  }

  // Mock Bridge Transaction
  async initiateBridge(amount: number): Promise<string> {
    if (!this.ethWallet) {
      throw new Error('Please connect MetaMask first');
    }

    try {
      // Real MetaMask transaction signing (but to mock contract)
      const transactionParameters = {
        to: '0x742d35Cc6634C0532925a3b8D69e0F74e13f31A9', // Mock contract
        from: this.ethWallet.address,
        value: '0x0', // 0 ETH for demo
        data: '0xa9059cbb', // Mock function call
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      // Update bridge status
      this.updateBridgeStatus('pending', txHash);
      
      // Simulate bridge completion after 3 seconds
      setTimeout(() => {
        this.updateBridgeStatus('completed', txHash);
      }, 3000);

      return txHash;

    } catch (error) {
      console.error('Bridge transaction error:', error);
      throw error;
    }
  }

  // Calculate Claimable Rewards
  calculateRewards(stakeAmount: number, daysStaked: number): RewardsClaim {
    const dailyRate = 0.000274; // ~10% APY
    const xlmAmount = stakeAmount * dailyRate * daysStaked;
    const xlmPrice = 0.24; // Mock XLM price
    
    return {
      amount: parseFloat(xlmAmount.toFixed(2)),
      token: 'XLM',
      usdValue: parseFloat((xlmAmount * xlmPrice).toFixed(2)),
      lastClaimed: '3 days ago',
      nextPayout: '4 hours'
    };
  }

  // Mock Claim Process using Freighter API
  async claimRewards(rewards: RewardsClaim): Promise<string> {
    if (!this.stellarWallet) {
      throw new Error('Please connect Freighter wallet first');
    }

    try {
      // In real app, would create Stellar transaction XDR and sign with Freighter
      // For demo, just show signing process
      
      this.updateClaimingStatus('signing');
      
      // Simulate signing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTxHash = 'stellar_' + Date.now().toString(36);
      this.updateClaimingStatus('success', mockTxHash, rewards.amount);
      
      return mockTxHash;

    } catch (error) {
      console.error('Claim error:', error);
      throw error;
    }
  }

  // Performance Data for Charts
  getPerformanceData() {
    return {
      baseline: {
        label: 'Manual DeFi',
        data: [4.2, 4.1, 4.3, 4.0, 3.9, 4.1],
        color: '#ef4444',
        totalReturn: 4.1
      },
      yieldspan: {
        label: 'Yieldspan AI',
        data: [9.4, 11.2, 10.8, 11.7, 12.1, 11.9],
        color: '#00d4aa',
        totalReturn: 11.2
      },
      dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      outperformance: {
        percentage: 7.1,
        dollarAmount: 2340,
        timeframe: '6 months'
      }
    };
  }

  // UI Update Methods
  private updateWalletUI(chain: 'ethereum' | 'stellar', wallet: WalletConnection) {
    const btnId = chain === 'ethereum' ? 'connectMetaMaskBtn' : 'connectFreighterBtn';
    const button = document.getElementById(btnId) as HTMLButtonElement;
    
    if (button) {
      button.textContent = `${chain === 'ethereum' ? 'ETH' : 'XLM'}: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
      button.style.background = 'var(--primary-light)';
      button.disabled = true;
      button.title = `Connected: ${wallet.balance} on ${wallet.network}`;
    }
  }

  private updateBridgeStatus(status: 'pending' | 'completed', txHash?: string) {
    const bridgeStatus = document.getElementById('bridge-status');
    if (!bridgeStatus) return;

    if (status === 'pending') {
      bridgeStatus.innerHTML = `
        <div class="bridge-pending">
          <strong>Bridge Transaction Pending</strong>
          <div>Processing cross-chain transfer...</div>
          <div class="bridge-hash">Hash: ${txHash}</div>
        </div>
      `;
    } else {
      bridgeStatus.innerHTML = `
        <div class="bridge-completed">
          <strong>Bridge Transaction Completed</strong>
          <div>Successfully transferred to Stellar network</div>
          <div class="bridge-hash">Hash: ${txHash}</div>
        </div>
      `;
    }
  }

  private updateClaimingStatus(status: 'signing' | 'success', txHash?: string, amount?: number) {
    const claimStatus = document.getElementById('claim-status');
    if (!claimStatus) return;

    if (status === 'signing') {
      claimStatus.innerHTML = `
        <div class="claim-signing">
          <span>Signing transaction with Freighter...</span>
        </div>
      `;
    } else {
      claimStatus.innerHTML = `
        <div class="claim-success">
          <span>Successfully claimed ${amount} XLM!</span>
          <div class="claim-hash">Tx: ${txHash}</div>
        </div>
      `;
    }
  }

  // Getters
  get isEthereumConnected(): boolean {
    return this.ethWallet?.connected || false;
  }

  get isStellarConnected(): boolean {
    return this.stellarWallet?.connected || false;
  }

  get canBridge(): boolean {
    return this.isEthereumConnected;
  }

  get canClaim(): boolean {
    return this.isStellarConnected;
  }

  get getEthWallet(): WalletConnection | null {
    return this.ethWallet;
  }

  get getStellarWallet(): WalletConnection | null {
    return this.stellarWallet;
  }
}

// Export singleton instance
export const walletManager = new WalletManager();

// Type declarations for window objects
declare global {
  interface Window {
    ethereum?: any;
  }
} 