import { ethers } from 'ethers';

// Contract configuration
const CONTRACT_ADDRESS = '0x2F4925f1e6A354C7e9d54175A586FE999d08d8D8';
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "stakeETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Withdrawn",
    "type": "event"
  }
];

export class EthStakingContract {
  private provider?: ethers.BrowserProvider;
  private signer?: ethers.Signer;
  private contract?: ethers.Contract;

  async connect(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found!');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
    
    console.log('✅ Contract connected:', CONTRACT_ADDRESS);
  }

  async stake(ethAmount: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not connected');
    }

    console.log(`🚀 Staking ${ethAmount} ETH...`);
    
    try {
      // Convert ETH amount to wei
      const weiAmount = ethers.parseEther(ethAmount.toString());
      
      // Call the stakeETH function
      const tx = await this.contract.stakeETH({
        value: weiAmount,
        gasLimit: 100000 // Reduced gas limit
      });

      console.log('📡 Transaction sent:', tx.hash);
      console.log('⏳ Waiting for confirmation...');

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('✅ Transaction confirmed!', receipt.hash);
        return receipt.hash;
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error) {
      console.error('❌ Staking failed:', error);
      throw error;
    }
  }

  async getStakeEvents(userAddress: string): Promise<any[]> {
    if (!this.contract) {
      throw new Error('Contract not connected');
    }

    try {
      const filter = this.contract.filters.Staked(userAddress);
      const events = await this.contract.queryFilter(filter, -1000); // Last 1000 blocks
      return events;
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      return [];
    }
  }

  get contractAddress(): string {
    return CONTRACT_ADDRESS;
  }
}

// Export singleton instance
export const stakingContract = new EthStakingContract(); 