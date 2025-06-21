```md
# 🌉 Multi-Yield Aggregator

**Multi-Yield Aggregator** is a cross-chain yield protocol enabling users to stake ETH on Ethereum and receive yield in XLM on Stellar via Soroban smart contracts. The architecture bridges native ETH staking with Stellar-based reward distribution using decentralized infrastructure and smart contract automation.

---

## ⚙️ Technical Overview
```
### 1. 🟡 Ethereum Side (Sepolia Testnet)

#### 🔸 Smart Contract: `ETHStakeBridge.sol`
- Allows users to stake native ETH using `stakeETH()`
- Emits a `Staked(address, uint256)` event on deposit
- Supports `emergencyWithdraw()` for balance recovery

**📄 Etherscan Deployment:**  
[View Contract on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x661F616253621851052c668b030bE795638eA859)
```
```
### 2. 🌐 Backend Listener (Node.js)

A backend script listens to `Staked` events on Ethereum, then interacts with Soroban to trigger rewards.

- Uses `ethers.js` to subscribe to Sepolia event logs
- Uses `soroban-client` to call `reward_user()` on Stellar
- Configured via `.env`: includes keys, contract ID, and RPC endpoints

```
```
### 3. 🌠 Stellar Side – Soroban Smart Contract

#### 🔸 Contract: `YieldVault` (Rust - `lib.rs`)
Deployed on Stellar Testnet via Soroban. Manages balances and reward distribution.

**Contract ID:**  
`CBXVR635627DNKXQKYLE2BBM72J43W35D4H6ZDHRFIB5TSSZNHEKI7EY`

**Core functions:**
- `deposit(user: Address, amount: i128)`
- `withdraw(user: Address, amount: i128)`
- `balance_of(user: Address) -> i128`
- `total_deposits() -> i128`
- `reward_user(user: Address, reward_amount: i128)` ← invoked via Ethereum bridge

**🔗 View on Stellar Expert:**  
[YieldVault Contract on Stellar Explorer](https://stellar.expert/explorer/testnet/contract/CBXVR635627DNKXQKYLE2BBM72J43W35D4H6ZDHRFIB5TSSZNHEKI7EY)

```
```
## 📁 Project Structure


<pre><code>
multi-yield-aggregator/
├── contracts/
│   └── lib.rs              # Soroban smart contract (Rust)
├── sol/
│   └── ETHStakeBridge.sol  # Ethereum staking bridge (Solidity)
├── scripts/
│   └── rewardUser.ts       # Backend caller for reward_user()
├── .env                    # Environment variables
└── README.md
</code></pre>

```

---

## 🔧 Development Flow

1. Wrote and deployed `ETHStakeBridge.sol` on Sepolia
2. Implemented event-based listener to monitor `Staked` events
3. Developed and deployed `YieldVault` on Soroban Testnet
4. Integrated TypeScript backend with Soroban via RPC and ABI
5. `reward_user()` successfully called upon ETH stake events

---

## 🧰 Tech Stack

- **Solidity / Ethereum (Sepolia)**  
- **Rust / Soroban (Stellar Testnet)**  
- **Node.js / TypeScript** – Bridge & backend
- **Soroban CLI & RPC**  
- **Ethers.js / Soroban-client**

---

## 👥 Contributors

- **Muhammed Akıncı** – Blockchain & Backend Developer  
- **ChatGPT** – Technical guidance & automation assistant

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
```

---
