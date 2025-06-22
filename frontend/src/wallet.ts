// Persistent Wallet Management for Yieldspan
// Handles MetaMask & Freighter connections with localStorage persistence

import { store } from './store';
import { 
  isConnected, 
  requestAccess, 
  getAddress, 
  getNetwork,
  signTransaction 
} from "@stellar/freighter-api";

// Persistence keys
const STORAGE_KEYS = {
  ETHEREUM_CONNECTED: 'yieldspan.wallet.ethereum.connected',
  STELLAR_CONNECTED: 'yieldspan.wallet.stellar.connected',
} as const;

// Persistence helpers
function savePersistence(wallet: 'ethereum' | 'stellar', connected: boolean): void {
  const key = wallet === 'ethereum' ? STORAGE_KEYS.ETHEREUM_CONNECTED : STORAGE_KEYS.STELLAR_CONNECTED;
  localStorage.setItem(key, connected ? '1' : '');
}

function loadPersistence(wallet: 'ethereum' | 'stellar'): boolean {
  const key = wallet === 'ethereum' ? STORAGE_KEYS.ETHEREUM_CONNECTED : STORAGE_KEYS.STELLAR_CONNECTED;
  return localStorage.getItem(key) === '1';
}

// Ethereum (MetaMask) Connection
export async function connectEthereum(): Promise<void> {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found! Please install MetaMask');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    });

    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [accounts[0], 'latest']
    });

    // Convert wei to ETH
    const ethBalance = (parseInt(balance, 16) / 1e18).toFixed(4);
    const networkName = chainId === '0xaa36a7' ? 'Sepolia Testnet' : `Chain ${chainId}`;

    store.setState({
      ethereum: {
        connected: true,
        address: accounts[0],
        chainId: chainId,
        balance: `${ethBalance} ETH`,
        network: networkName,
      }
    });

    savePersistence('ethereum', true);
    
  } catch (error) {
    console.error('MetaMask connection error:', error);
    savePersistence('ethereum', false);
    throw error;
  }
}

// Stellar (Freighter) Connection
export async function connectStellar(): Promise<void> {
  try {
    const connectionCheck = await isConnected();
    
    if (!connectionCheck.isConnected) {
      throw new Error('Freighter not found! Please install Freighter wallet');
    }

    const accessResult = await requestAccess();
    
    if (accessResult.error) {
      throw new Error(`Freighter access denied: ${accessResult.error}`);
    }

    const networkResult = await getNetwork();
    const networkName = networkResult.error ? 'Unknown Network' : networkResult.network;
    
    // Mock XLM balance (in real app, would call Stellar Horizon API)
    const mockXlmBalance = (Math.random() * 1000 + 500).toFixed(2);

    store.setState({
      stellar: {
        connected: true,
        address: accessResult.address,
        balance: `${mockXlmBalance} XLM`,
        network: networkName,
      }
    });

    savePersistence('stellar', true);

  } catch (error) {
    console.error('Freighter connection error:', error);
    savePersistence('stellar', false);
    throw error;
  }
}

// Disconnect functions
export function disconnectEthereum(): void {
  store.setState({
    ethereum: {
      connected: false,
      address: null,
      chainId: null,
      balance: null,
      network: null,
    }
  });
  savePersistence('ethereum', false);
}

export function disconnectStellar(): void {
  store.setState({
    stellar: {
      connected: false,
      address: null,
      balance: null,
      network: null,
    }
  });
  savePersistence('stellar', false);
}

// Event handlers for MetaMask
function handleEthereumAccountsChanged(accounts: string[]): void {
  if (accounts.length === 0) {
    disconnectEthereum();
  } else {
    const currentState = store.getState();
    if (currentState.ethereum.connected) {
      store.setState({
        ethereum: {
          ...currentState.ethereum,
          address: accounts[0],
        }
      });
    }
  }
}

function handleEthereumChainChanged(chainId: string): void {
  const currentState = store.getState();
  if (currentState.ethereum.connected) {
    const networkName = chainId === '0xaa36a7' ? 'Sepolia Testnet' : `Chain ${chainId}`;
    store.setState({
      ethereum: {
        ...currentState.ethereum,
        chainId: chainId,
        network: networkName,
      }
    });
  }
}

// Auto-reconnection logic
export async function initializeWalletConnections(): Promise<void> {
  try {
    // Set up MetaMask event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleEthereumAccountsChanged);
      window.ethereum.on('chainChanged', handleEthereumChainChanged);

      // Try to reconnect MetaMask if previously connected
      if (loadPersistence('ethereum')) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            });
            
            const ethBalance = (parseInt(balance, 16) / 1e18).toFixed(4);
            const networkName = chainId === '0xaa36a7' ? 'Sepolia Testnet' : `Chain ${chainId}`;

            store.setState({
              ethereum: {
                connected: true,
                address: accounts[0],
                chainId: chainId,
                balance: `${ethBalance} ETH`,
                network: networkName,
              }
            });
          } else {
            savePersistence('ethereum', false);
          }
        } catch (err) {
          console.error('Ethereum reconnect failed:', err);
          savePersistence('ethereum', false);
        }
      }
    }

    // Try to reconnect Freighter if previously connected
    if (loadPersistence('stellar')) {
      try {
        const connectionCheck = await isConnected();
        if (connectionCheck.isConnected) {
          const accessResult = await requestAccess();
          if (!accessResult.error) {
            const networkResult = await getNetwork();
            const networkName = networkResult.error ? 'Unknown Network' : networkResult.network;
            const mockXlmBalance = (Math.random() * 1000 + 500).toFixed(2);

            store.setState({
              stellar: {
                connected: true,
                address: accessResult.address,
                balance: `${mockXlmBalance} XLM`,
                network: networkName,
              }
            });
          } else {
            savePersistence('stellar', false);
          }
        } else {
          savePersistence('stellar', false);
        }
      } catch (err) {
        console.error('Stellar reconnect failed:', err);
        savePersistence('stellar', false);
      }
    }

  } catch (error) {
    console.error('Wallet initialization error:', error);
  }
}

// Utility functions
export function getWalletState() {
  return store.getState();
}

export function canBridge(): boolean {
  const state = store.getState();
  return state.ethereum.connected && state.stellar.connected;
}

export function canClaim(): boolean {
  const state = store.getState();
  return state.stellar.connected;
}

// Calculate rewards (moved from walletIntegration.ts)
export function calculateRewards(stakeAmount: number, daysStaked: number) {
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

// Mock claim process
export async function claimRewards(rewards: ReturnType<typeof calculateRewards>): Promise<string> {
  const state = store.getState();
  if (!state.stellar.connected) {
    throw new Error('Please connect Freighter wallet first');
  }

  try {
    // Simulate signing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTxHash = 'stellar_' + Date.now().toString(36);
    
    return mockTxHash;

  } catch (error) {
    console.error('Claim error:', error);
    throw error;
  }
}

// TypeScript augmentation for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
} 