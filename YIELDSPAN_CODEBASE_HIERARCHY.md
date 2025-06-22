 # 🌟 Yieldspan Backend - Complete Codebase Hierarchy

## 🏗️ **TOP-LEVEL ARCHITECTURE**

```
Yieldspan Backend
├── 🔗 Cross-Chain Bridge (Ethereum ↔ Stellar)
├── 🤖 AI-Powered Portfolio Optimization
├── 📊 Arbitrage Detection Engine  
├── 🌐 RESTful API Server
├── 💼 Smart Contract Layer
└── 🖥️ Web Frontend Interface
```

---

## 🎯 **CORE COMPONENTS HIERARCHY**

### 1. 🔐 **SMART CONTRACTS & BLOCKCHAIN LAYER**

#### 1.1 Ethereum Smart Contracts (Solidity)
```
contracts/
├── ETHStakeBridge.sol                    # Main staking contract
│   ├── stakeETH()                       # Accept ETH deposits
│   ├── emergencyWithdraw()              # Emergency fund recovery
│   ├── Staked(address, uint256) event   # Cross-chain trigger event
│   └── balances mapping                 # User stake tracking
├── artifacts/                           # Compiled contract artifacts
│   └── build-info/                     # Compilation metadata
└── typechain-types/                     # TypeScript contract bindings
    ├── ETHStakeBridge.ts               # Generated contract types
    └── factories/                      # Contract factory types
```

#### 1.2 Stellar Smart Contracts (Rust/Soroban)
```
yield-vault/
├── contracts/hello-world/src/
│   ├── lib.rs                          # Main Soroban contract
│   │   ├── deposit(user, amount)       # User balance management
│   │   ├── withdraw(user, amount)      # Withdrawal functionality
│   │   ├── reward_user(user, amount)   # Cross-chain reward distribution
│   │   ├── set_strategy(user, strategy) # Dynamic strategy assignment
│   │   ├── select_strategy(spread%)    # AI strategy selection
│   │   └── log_arbitrage_opportunity() # Arbitrage tracking
│   └── test.rs                         # Contract unit tests
├── Cargo.toml                          # Rust dependencies
└── bindings/                           # TypeScript bindings for Soroban
    └── src/index.ts                    # Contract interaction helpers
```

---

### 2. 🌉 **CROSS-CHAIN BRIDGE INFRASTRUCTURE**

```
bridge/
├── ethListener.ts                       # Ethereum event monitoring
│   ├── Monitors 'Staked' events        # Real-time event detection
│   ├── Maps ETH→Stellar addresses      # Address translation
│   └── Triggers Soroban rewards        # Cross-chain communication
├── callSorobanReward.ts                # Stellar contract interaction
│   ├── Executes reward_user()          # Reward distribution
│   └── Uses Stellar CLI commands       # Native Soroban calls
├── addressMap.ts                       # ETH ↔ Stellar address mapping
├── config.ts                           # Bridge configuration
│   ├── CONTRACT_ID                     # Soroban contract identifier
│   ├── SOROBAN_SECRET                  # Signing credentials
│   └── Network configurations          # Testnet settings
└── testStake.ts                        # Bridge testing utilities
```

---

### 3. 🧠 **AI-POWERED PORTFOLIO OPTIMIZATION**

#### 3.1 Mathematical Optimization Engine
```
src/allocation/
├── optimizer.ts                        # Mean-Variance Optimization (MPT)
│   ├── optimizePortfolio()            # Gradient descent optimization
│   ├── Sharpe ratio maximization      # Risk-adjusted returns
│   └── Weight normalization           # Portfolio constraints
├── analytics.ts                       # Statistical computations
│   ├── calculateLogReturns()          # Price return analysis
│   ├── calculateCovarianceMatrix()    # Asset correlation
│   ├── calculateExpectedReturns()     # Return forecasting
│   └── calculateCorrelationMatrix()   # Correlation analysis
├── dataFetcher.ts                     # Historical price data
│   ├── fetchDailyPrices()            # CoinGecko API integration
│   ├── downsampleWeekly()            # Data frequency reduction
│   └── Token mapping (ETH, stETH, XLM, USDT, USDC)
├── backtest.ts                        # Strategy backtesting
└── allocator.ts                       # Result formatting
    └── formatAllocations()            # Output standardization
```

#### 3.2 Strategy Management
```
src/strategies/
├── strategySelector.ts                 # Dynamic strategy selection
│   ├── Conservative (<20% spread)     # Low-risk allocation
│   ├── Balanced (20-50% spread)       # Medium-risk allocation
│   └── Aggressive (>50% spread)       # High-risk allocation
├── calculateYield.ts                  # Yield projection
├── rebalancer.ts                      # Portfolio rebalancing
│   ├── isBalanced()                   # Balance threshold check
│   └── generateActions()              # Rebalancing instructions
└── runOptimizer.ts                    # Optimization orchestration
```

---

### 4. 📈 **ARBITRAGE DETECTION ENGINE**

```
src/arbitrage/
├── fetchPrices.ts                     # Multi-source price aggregation
│   ├── fetchUsdtXlmPrices()          # USDT-XLM price discovery
│   │   ├── DexScreener API           # DEX price data
│   │   └── CoinGecko API             # CEX price data
│   └── fetchEthXlmPrices()           # ETH-XLM price discovery
├── simulateArbitrage.ts               # Arbitrage opportunity analysis
│   ├── Price spread calculation       # Profit margin analysis
│   ├── Simulated profit estimation    # Return projections
│   └── Best/worst source identification
└── Strategy integration               # Links to portfolio optimization
```

#### 4.1 Logging & Analytics
```
src/logging/
├── arbitrageLogger.ts                 # Arbitrage opportunity logging
logs/
├── ETH-XLM-arbitrage-log.json        # ETH-XLM opportunity history
└── USDT-XLM-arbitrage-log.json       # USDT-XLM opportunity history
```

---

### 5. 💼 **PORTFOLIO MANAGEMENT SYSTEM**

```
src/portfolio/
└── portfolioManager.ts                # Central portfolio orchestration
    ├── simulatePortfolio()            # Portfolio simulation
    ├── getAllocationByStrategy()       # Strategy-based allocation
    ├── calculatePortfolioReturn()     # Return calculation
    └── Strategy types: conservative|balanced|aggressive
```

---

### 6. 🌐 **API SERVER & ROUTING**

#### 6.1 Server Configuration
```
src/
├── server.ts                          # Main Express server (port 3000)
├── app.ts                            # Express app configuration
└── index.ts                          # Application entry point
server.ts                             # Alternative server (port 8787)
```

#### 6.2 API Endpoints
```
src/routes/
└── allocation.ts                      # Portfolio optimization endpoints
    ├── POST /api/allocate             # Portfolio allocation request
    ├── POST /api/optimize             # Optimization request
    └── Integration with optimization engine
```

---

### 7. 🖥️ **FRONTEND INTERFACE**

#### 7.1 Core Frontend Architecture
```
frontend/
├── src/
│   ├── main.ts                       # Main application logic
│   │   ├── YieldspanApp class        # Main app controller
│   │   ├── Portfolio optimization UI  # User interaction
│   │   ├── Loading animations        # ML process visualization
│   │   └── Results visualization     # Allocation charts
│   ├── walletIntegration.ts          # Multi-wallet support
│   │   ├── MetaMask integration      # Ethereum wallet
│   │   ├── Freighter integration     # Stellar wallet
│   │   ├── Bridge transaction support # Cross-chain operations
│   │   └── Reward claiming system    # XLM reward distribution
│   ├── performanceCharts.ts          # Chart visualization
│   └── style.css                     # UI styling
├── index.html                        # Main HTML template
└── package.json                      # Frontend dependencies (Vite + TypeScript)
```

---

### 8. 🚀 **DEPLOYMENT & OPERATIONS**

#### 8.1 Smart Contract Deployment
```
scripts/
├── deploy.ts                         # Ethereum contract deployment
├── sendReward.ts                     # Reward distribution testing
└── stake.ts                          # Staking functionality testing
```

#### 8.2 Development & Testing
```
test/                                 # Comprehensive test suite
├── Smart contract tests
│   ├── calculateYield.test.ts
│   ├── fetchPrices.test.ts
│   ├── portfolioManager.test.ts
│   ├── rebalancer.test.ts
│   ├── simulateArbitrage.test.ts
│   ├── sorobanClient.test.ts
│   └── strategySelector.test.ts
└── src/test/                        # Additional unit tests
    ├── allocation.test.ts
    ├── allocator.test.ts
    ├── analytics.test.ts
    ├── dataFetcher.test.ts
    └── runOptimizer.test.ts
```

#### 8.3 Configuration Files
```
Root Configuration:
├── package.json                      # Node.js dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── hardhat.config.ts                 # Ethereum development environment
├── jest.config.js                    # Testing framework setup
└── deploy.sh                         # Deployment automation
```

---

## 🔄 **DATA FLOW ARCHITECTURE**

### Cross-Chain Bridge Flow
```
1. User stakes ETH → ETHStakeBridge.sol
2. 'Staked' event emitted → ethListener.ts
3. Address mapping → addressMap.ts
4. Soroban reward call → callSorobanReward.ts
5. XLM rewards distributed → YieldVault contract
```

### Optimization Flow
```
1. Historical data fetch → dataFetcher.ts
2. Statistical analysis → analytics.ts
3. Optimization algorithm → optimizer.ts
4. Strategy selection → strategySelector.ts
5. Portfolio allocation → allocator.ts
6. API response → allocation.ts
```

### Arbitrage Flow
```
1. Price data aggregation → fetchPrices.ts
2. Spread analysis → simulateArbitrage.ts
3. Strategy adaptation → strategySelector.ts
4. Soroban strategy update → YieldVault.set_strategy()
```

---

## 🔧 **EXTERNAL INTEGRATIONS**

### APIs & Data Sources
- **CoinGecko API**: Price data for ETH, stETH, XLM, USDT, USDC
- **DexScreener API**: DEX price data for arbitrage
- **Ethereum RPC**: Sepolia testnet interaction
- **Stellar RPC**: Soroban contract interaction

### Blockchain Networks
- **Ethereum Sepolia**: Testing environment for ETH staking
- **Stellar Testnet**: XLM reward distribution
- **Contract Addresses**: 
  - ETH: `0x661F616253621851052c668b030bE795638eA859`
  - Stellar: `CC5K75G7UM6LNBV4ISEFEMYGPHC4AUNO72WVJWYTY777RJ3622P7WVGQ`

---

## 📚 **DOCUMENTATION ECOSYSTEM**

```
docs/                                 # Comprehensive project documentation
├── book/                            # GitBook documentation
├── src/                             # Markdown documentation
│   ├── architecture.md              # System architecture
│   ├── api-docs.md                  # API documentation
│   ├── smart-contracts.md           # Contract specifications
│   ├── cross-chain-bridge.md        # Bridge architecture
│   ├── arbitrage-engine.md          # Arbitrage system
│   ├── ml-algorithm.md              # ML optimization details
│   ├── deployment.md                # Deployment guide
│   ├── security.md                  # Security considerations
│   ├── testing-strategy.md          # Testing approach
│   └── performance.md               # Performance analysis
└── Additional strategic documents
    ├── market-opportunity.md
    ├── competitive-analysis.md
    ├── revenue-model.md
    └── roadmap.md
```

---

## 🎯 **KEY INNOVATIONS & FEATURES**

1. **Cross-Chain Yield Optimization**: ETH staking → XLM rewards
2. **AI-Driven Strategy Selection**: Dynamic allocation based on market conditions
3. **Real-Time Arbitrage Detection**: Multi-source price aggregation
4. **Mathematical Portfolio Optimization**: Mean-Variance Optimization with gradient descent
5. **Event-Driven Architecture**: Ethereum events trigger Stellar rewards
6. **Multi-Wallet Integration**: Seamless MetaMask + Freighter support
7. **Comprehensive Testing**: Unit tests for all critical components
8. **Production-Ready Deployment**: Automated deployment scripts and configuration

This codebase represents a sophisticated DeFi platform combining traditional portfolio theory with modern cross-chain infrastructure and AI-powered optimization strategies.