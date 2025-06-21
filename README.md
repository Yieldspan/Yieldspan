# 🌉 Yieldspan - Multi-Yield Aggregator

**Yieldspan** is a cross-chain yield protocol enabling users to stake ETH on Ethereum and receive yield in XLM on Stellar via Stellar smart contracts. The architecture bridges native ETH staking with Stellar-based reward distribution using decentralized infrastructure and smart contract automation.

---

## ⚙️ Technical Overview

### 1. 🟡 Ethereum Side (Sepolia Testnet)

#### 🔸 Smart Contract: `ETHStakeBridge.sol`
- Allows users to stake native ETH using `stakeETH()`
- Emits a `Staked(address, uint256)` event on deposit
- Supports `emergencyWithdraw()` for balance recovery

**📄 Etherscan Deployment:**  
[View Contract on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x661F616253621851052c668b030bE795638eA859)

---

### 2. 🌐 Backend Listener & Arbitrage Engine (TypeScript)

BThe backend includes both a listener that monitors Ethereum staking events and a strategy engine that analyzes XLM-based arbitrage opportunities.

#### 🔹 ETH Stake Listener
- Monitors `Staked` events on Sepolia using `ethers.js`.
- Interacts with the Soroban contract via `soroban-client` to call the `reward_user()` function after the event.
- Configured via `.env`: `ETH_RPC_URL`, `SOROBAN_SECRET`, `CONTRACT_ID`, etc.

#### 🔹 Arbitrage Engine
- **XLM-based price data** (USDT-XLM and ETH-XLM) is collected from Coingecko and Dexscreener.
- Arbitrage opportunities are evaluated by calculating the best price, worst price, spread percentage, and simulated profit.
- Logs are written to separate log files (`/logs/usdt-xlm-arbitrage-log.json`, `/logs/eth-xlm-arbitrage-log.json`) based on the selected token pairs.
- One of the following three strategies is selected based on the spread ratio:
  - `conserv` (spread < 20%)
  - `balanced` (20% ≤ spread < 50%)
  - `aggress` (spread ≥ 50%)

#### 🔹 Vault Strategy Integration
- The selected strategy is sent to the `YieldVault` contract on Soroban via `set_strategy()` in the backend.
- This enables the implementation of a dynamic, user-based investment strategy supported by historical data.

---

### 3. 🌠 Stellar Side – Stellar Smart Contract

#### 🔸 Contract: `YieldVault` (Rust - `lib.rs`)
Deployed on Stellar Testnet via Soroban. Manages balances, strategies, and reward distribution.

**Contract ID:**  
`CC5K75G7UM6LNBV4ISEFEMYGPHC4AUNO72WVJWYTY777RJ3622P7WVGQ`

**Core functions:**
- `deposit(user: Address, amount: i128)`
- `withdraw(user: Address, amount: i128)`
- `balance_of(user: Address) -> i128`
- `total_deposits() -> i128`
- `reward_user(user: Address, reward_amount: i128)`
- `set_strategy(user: Address, strategy: Symbol)`
- `get_strategy(user: Address) -> Symbol`
- `select_strategy(spread_percentage: i128) -> Symbol`

**🔗 View on Stellar Expert:**  
[YieldVault Contract on Stellar Explorer](https://stellar.expert/explorer/testnet/contract/CC5K75G7UM6LNBV4ISEFEMYGPHC4AUNO72WVJWYTY777RJ3622P7WVGQ)

---
**📁 Project Structure:**
<pre><code>
bridge/
├── addressMap.ts
├── callSorobanReward.ts
├── config.ts
├── ethListener.ts
├── testStake.ts
contracts/
├── ETHStakeBridge.sol
scripts/
├── deploy.ts
├── sendReward.ts
├── stake.ts
src/
├── arbitrage/
│   ├── fetchPrices.ts
│   ├── simulateArbitrage.ts
│   ├── strategySelector.ts
│   └── logArbitrageResult.ts
├── logging/
|   ├──arbitrageLogger.ts
├── portfolio/
|   ├── portfolioManager.ts
├── strategies/
|   ├──calculateYield.ts
|   ├──rebalancer.ts
|   ├──strategySelector.ts
├── index.ts
test/
├── simulateArbitrage.test.ts
├── strategySelector.test.ts
├── calculateYield.test.ts
├── fetchPrices.test.ts
├── portfolioManager.test.ts
├── rebalancer.test.ts
├── sorobanClient.test.ts
yield-vault/
├── contracts/
    ├── hello_world/
        ├── src/
            ├── lib.rs
            ├── test.rs
</code></pre>


---

## 🔧 Development Flow

1. Wrote and deployed `ETHStakeBridge.sol` on Sepolia  
2. Implemented event-based listener to monitor `Staked` events  
3. Developed and deployed `YieldVault` on Soroban Testnet  
4. Integrated TypeScript backend with Soroban via RPC and ABI  
5. Created arbitrage engine to detect and log USDT-XLM & ETH-XLM price spreads  
6. Built a strategy selector and integrated it into `YieldVault` contract  
7. Logged price data and selected strategy are stored and passed to smart contract

---

## 🧰 Tech Stack

- **Solidity / Ethereum (Sepolia)**  
- **Rust / Soroban (Stellar Testnet)**  
- **Node.js / TypeScript** – Bridge & backend  
- **Stellar CLI & RPC**  
- **Ethers.js / Soroban-client**
  
---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
