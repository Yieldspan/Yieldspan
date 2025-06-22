// Lightweight State Manager for Yieldspan Wallet Persistence
// Similar to React's useState + useEffect but in vanilla TypeScript

export interface WalletState {
  ethereum: {
    connected: boolean;
    address: string | null;
    chainId: string | null;
    balance: string | null;
    network: string | null;
  };
  stellar: {
    connected: boolean;
    address: string | null;
    balance: string | null;
    network: string | null;
  };
}

type StateListener = (state: WalletState) => void;

export const store = (() => {
  let state: WalletState = {
    ethereum: {
      connected: false,
      address: null,
      chainId: null,
      balance: null,
      network: null,
    },
    stellar: {
      connected: false,
      address: null,
      balance: null,
      network: null,
    },
  };

  const listeners = new Set<StateListener>();

  function subscribe(fn: StateListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function setState(patch: Partial<WalletState>): void {
    state = { 
      ...state, 
      ...patch,
      ethereum: { ...state.ethereum, ...(patch.ethereum || {}) },
      stellar: { ...state.stellar, ...(patch.stellar || {}) }
    };
    listeners.forEach(fn => fn(state));
  }

  function getState(): WalletState {
    return { 
      ...state,
      ethereum: { ...state.ethereum },
      stellar: { ...state.stellar }
    };
  }

  return { subscribe, setState, getState };
})(); 