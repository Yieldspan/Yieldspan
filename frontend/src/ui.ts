// Reactive UI System for Yieldspan Wallet Connections
// Subscribes to store changes and updates DOM reactively

import { store } from './store';
import { connectEthereum, connectStellar, disconnectEthereum, disconnectStellar, canBridge, canClaim, calculateRewards, claimRewards } from './wallet';
import type { WalletState } from './store';

interface UIElements {
  metaMaskBtn: HTMLButtonElement;
  freighterBtn: HTMLButtonElement;
  walletInfo: HTMLElement;
  claimBtn: HTMLButtonElement;
  claimSection: HTMLElement;
}

class ReactiveUI {
  private elements: UIElements;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.elements = this.getUIElements();
    this.initializeEventListeners();
    this.subscribeToStateChanges();
  }

  private getUIElements(): UIElements {
    return {
      metaMaskBtn: document.getElementById('connectMetaMaskBtn') as HTMLButtonElement,
      freighterBtn: document.getElementById('connectFreighterBtn') as HTMLButtonElement,
      walletInfo: document.getElementById('wallet-info') || this.createWalletInfoElement(),
      claimBtn: document.getElementById('claimRewardsBtn') as HTMLButtonElement,
      claimSection: document.getElementById('claimingSection') as HTMLElement,
    };
  }

  private createWalletInfoElement(): HTMLElement {
    const element = document.createElement('div');
    element.id = 'wallet-info';
    element.style.cssText = `
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
    `;
    
    // Insert after wallet buttons
    const container = document.querySelector('.wallet-connections');
    if (container) {
      container.appendChild(element);
    }
    
    return element;
  }

  private initializeEventListeners(): void {
    // MetaMask connection
    this.elements.metaMaskBtn.addEventListener('click', async () => {
      const state = store.getState();
      if (state.ethereum.connected) {
        disconnectEthereum();
      } else {
        try {
          this.elements.metaMaskBtn.textContent = 'Connecting...';
          this.elements.metaMaskBtn.disabled = true;
          await connectEthereum();
        } catch (error) {
          console.error('MetaMask connection failed:', error);
          alert('MetaMask connection failed. Please try again.');
        } finally {
          this.elements.metaMaskBtn.disabled = false;
        }
      }
    });

    // Freighter connection
    this.elements.freighterBtn.addEventListener('click', async () => {
      const state = store.getState();
      if (state.stellar.connected) {
        disconnectStellar();
      } else {
        try {
          this.elements.freighterBtn.textContent = 'Connecting...';
          this.elements.freighterBtn.disabled = true;
          await connectStellar();
        } catch (error) {
          console.error('Freighter connection failed:', error);
          alert('Freighter connection failed. Please try again.');
        } finally {
          this.elements.freighterBtn.disabled = false;
        }
      }
    });

    // Claim rewards
    if (this.elements.claimBtn) {
      this.elements.claimBtn.addEventListener('click', async () => {
        if (!canClaim()) {
          alert('Please connect your Stellar wallet first');
          return;
        }
        
        try {
          this.elements.claimBtn.disabled = true;
          this.elements.claimBtn.textContent = 'Claiming...';
          
          const rewards = calculateRewards(1000, 30);
          const txHash = await claimRewards(rewards);
          
          this.showClaimSuccess(rewards.amount, txHash);
          
        } catch (error) {
          console.error('Claiming failed:', error);
          alert('Claiming failed. Please try again.');
        } finally {
          this.elements.claimBtn.disabled = false;
          this.updateClaimButton();
        }
      });
    }
  }

  private subscribeToStateChanges(): void {
    this.unsubscribe = store.subscribe((state: WalletState) => {
      this.updateUI(state);
    });

    // Initial render
    this.updateUI(store.getState());
  }

  private updateUI(state: WalletState): void {
    this.updateMetaMaskButton(state.ethereum);
    this.updateFreighterButton(state.stellar);
    this.updateWalletInfo(state);
    this.updateClaimButton();
    this.updateClaimSection(state);
  }

  private updateMetaMaskButton(ethereum: WalletState['ethereum']): void {
    if (ethereum.connected) {
      this.elements.metaMaskBtn.textContent = 'Disconnect MetaMask';
      this.elements.metaMaskBtn.classList.add('connected');
      this.elements.metaMaskBtn.style.background = '#28a745';
    } else {
      this.elements.metaMaskBtn.textContent = 'Connect MetaMask';
      this.elements.metaMaskBtn.classList.remove('connected');
      this.elements.metaMaskBtn.style.background = '';
    }
  }

  private updateFreighterButton(stellar: WalletState['stellar']): void {
    if (stellar.connected) {
      this.elements.freighterBtn.textContent = 'Disconnect Freighter';
      this.elements.freighterBtn.classList.add('connected');
      this.elements.freighterBtn.style.background = '#28a745';
    } else {
      this.elements.freighterBtn.textContent = 'Connect Freighter';
      this.elements.freighterBtn.classList.remove('connected');
      this.elements.freighterBtn.style.background = '';
    }
  }

  private updateWalletInfo(state: WalletState): void {
    let infoHTML = '<div style="font-size: 14px; line-height: 1.6;">';
    
    if (!state.ethereum.connected && !state.stellar.connected) {
      infoHTML += '🔌 No wallets connected';
    } else {
      if (state.ethereum.connected) {
        infoHTML += `
          <div style="margin-bottom: 10px;">
            <strong>🦊 MetaMask:</strong><br>
            Address: <code style="font-size: 12px;">${this.truncateAddress(state.ethereum.address!)}</code><br>
            Balance: ${state.ethereum.balance}<br>
            Network: ${state.ethereum.network}
          </div>
        `;
      }
      
      if (state.stellar.connected) {
        infoHTML += `
          <div style="margin-bottom: 10px;">
            <strong>⭐ Freighter:</strong><br>
            Address: <code style="font-size: 12px;">${this.truncateAddress(state.stellar.address!)}</code><br>
            Balance: ${state.stellar.balance}<br>
            Network: ${state.stellar.network}
          </div>
        `;
      }
      
      if (canBridge()) {
        infoHTML += '<div style="color: #28a745; font-weight: 500;">✅ Bridge Ready</div>';
      }
    }
    
    infoHTML += '</div>';
    this.elements.walletInfo.innerHTML = infoHTML;
  }

  private updateClaimButton(): void {
    if (!this.elements.claimBtn) return;

    if (canClaim()) {
      this.elements.claimBtn.disabled = false;
      this.elements.claimBtn.textContent = 'Claim Yields to Stellar Wallet';
      this.elements.claimBtn.style.background = '#00d4aa';
    } else {
      this.elements.claimBtn.disabled = true;
      this.elements.claimBtn.textContent = 'Connect Stellar Wallet to Claim';
      this.elements.claimBtn.style.background = '#6c757d';
    }
  }

  private updateClaimSection(state: WalletState): void {
    if (!this.elements.claimSection) return;

    if (canClaim()) {
      this.elements.claimSection.style.display = 'block';
      
      // Update rewards display if available
      const rewardsAmount = document.getElementById('rewardsAmount');
      const rewardsUsd = document.getElementById('rewardsUsd');
      
      if (rewardsAmount && rewardsUsd) {
        const rewards = calculateRewards(1000, 30);
        rewardsAmount.textContent = `${rewards.amount} XLM`;
        rewardsUsd.textContent = `($${rewards.usdValue})`;
      }
    } else {
      this.elements.claimSection.style.display = 'none';
    }
  }

  private showClaimSuccess(amount: number, txHash: string): void {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="margin-bottom: 5px;">🎉 Claim Successful!</div>
      <div style="font-size: 14px; opacity: 0.9;">
        ${amount} XLM claimed<br>
        <code style="font-size: 12px;">${this.truncateAddress(txHash)}</code>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  private truncateAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

// Initialize reactive UI
export const reactiveUI = new ReactiveUI(); 