# Architecture Overview

## System Design Philosophy

Yieldspan follows a **ML-first architecture** where the intelligence layer is the core differentiator, and blockchain interactions are standardized infrastructure.

### 🧠 Intelligence Layer (Our Core IP)

```
┌─────────────────────────────────────────┐
│            ML Engine Core              │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ Data Ingestion │  │ Feature Engineering │  │
│  │ - Yield APIs   │  │ - Market Indicators │  │
│  │ - Price Feeds  │  │ - Risk Metrics     │  │
│  │ - TVL Data     │  │ - Correlations     │  │
│  └─────────────┘  └─────────────────┘  │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ ML Models     │  │ Portfolio Optimizer │  │
│  │ - Ensemble    │  │ - Risk-Adjusted    │  │
│  │ - Backtesting │  │ - Gas-Aware        │  │
│  │ - Validation  │  │ - Time-Sensitive   │  │
│  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘
```

### 🔗 Infrastructure Layer (Standard DeFi)

```
┌─────────────────────────────────────────┐
│          Execution Engine              │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ Transaction  │  │ Cross-Chain     │  │
│  │ Batching     │  │ Bridge (Mocked) │  │
│  │ - Gas Optimization│ │ - Ethereum → Stellar │  │
│  │ - MEV Protection │  │ - Status Tracking   │  │
│  └─────────────┘  └─────────────────┘  │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ Protocol    │  │ Portfolio       │  │
│  │ Integrations │  │ Monitoring      │  │
│  │ - Compound   │  │ - Performance   │  │
│  │ - Aave       │  │ - Rebalancing   │  │
│  │ - Curve      │  │ - Risk Alerts   │  │
│  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘
```

## Component Details

### 📊 Data Pipeline

```typescript
interface DataPipeline {
  // Real-time yield data
  yieldSources: {
    compound: CompoundAPI;
    aave: AaveSubgraph;
    curve: CurveRegistry;
    defipulse: DeFiPulseAPI;
  };
  
  // Market data
  marketData: {
    prices: CoinGeckoAPI;
    gas: EthGasStationAPI;
    volatility: CryptoFearGreedAPI;
  };
  
  // Risk data
  riskData: {
    audits: SecurityScoringAPI;
    tvl: DeFiLlamaAPI;
    events: BlockchainSecurityDB;
  };
}
```

### 🤖 ML Service

```python
class MLService:
    def __init__(self):
        self.data_pipeline = DataPipeline()
        self.feature_engine = FeatureEngine()
        self.model_ensemble = YieldspanEnsemble()
        
    async def predict_allocation(self, capital: float, weeks: int):
        # Fetch current market state
        market_data = await self.data_pipeline.get_current_state()
        
        # Engineer features for ML model
        features = self.feature_engine.transform(
            capital, weeks, market_data
        )
        
        # Predict optimal allocation
        allocation = self.model_ensemble.predict(features)
        
        # Add safety constraints
        allocation = self.apply_safety_constraints(allocation)
        
        return {
            'allocation': allocation,
            'expected_apy': self.calculate_expected_apy(allocation),
            'risk_score': self.calculate_risk_score(allocation),
            'confidence': self.model_ensemble.get_confidence()
        }
```

### 🌉 Cross-Chain Layer (Mocked for Hackathon)

```typescript
class CrossChainBridge {
  // For hackathon demo - mocked implementation
  async mockStakeAndReward(
    ethAmount: number, 
    stellarAddress: string
  ): Promise<TransactionStatus> {
    
    // Simulate ETH staking transaction
    const ethTx = this.simulateEthereumStake(ethAmount);
    
    // Simulate cross-chain message
    await this.simulateDelay(5000); // 5 second "bridge time"
    
    // Simulate Stellar reward distribution  
    const stellarTx = this.simulateStellarReward(
      stellarAddress, 
      ethAmount * 100 // Mock conversion rate
    );
    
    return {
      status: 'completed',
      ethTx: ethTx.hash,
      stellarTx: stellarTx.hash,
      timestamp: new Date()
    };
  }
}
```

### 📱 Frontend Architecture

```typescript
// React + TypeScript + Tailwind
interface AppState {
  wallet: WalletConnection;
  portfolio: PortfolioState;
  mlPredictions: AllocationPrediction[];
  transactions: TransactionHistory[];
}

// Key components
const components = {
  'WalletConnect': 'MetaMask + Freighter integration',
  'StrategySelector': 'ML-driven allocation display',  
  'PortfolioDashboard': 'Real-time performance tracking',
  'TransactionMonitor': 'Cross-chain status updates'
};
```

## Deployment Strategy

### 🚀 Hackathon Demo Stack

```yaml
Frontend:
  - React SPA deployed on Vercel
  - QR code for mobile access
  - Responsive design for judges' phones

Backend:
  - Node.js API on Railway/Render
  - ML service as Python microservice
  - Mock bridge for cross-chain demo

Data:
  - SQLite for demo data
  - Pre-computed ML predictions
  - Static yield data for consistency
```

### 🏭 Production Architecture (Future)

```yaml
Frontend:
  - Multi-tenant SPA
  - Native mobile apps
  - Web3 wallet integrations

Backend:
  - Kubernetes cluster
  - Real-time ML inference
  - Event-driven rebalancing

Data:
  - PostgreSQL for user data
  - ClickHouse for time-series data
  - Redis for real-time caching

Infrastructure:
  - Real cross-chain bridges
  - Multi-protocol integrations
  - Advanced monitoring/alerting
```

## Key Design Decisions

### ✅ What We Built (Core Value)
- **ML optimization engine** - Our unique differentiation
- **Clean, simple UX** - Two inputs → optimal portfolio
- **Real historical backtesting** - Proves the concept works

### 🔄 What We Simplified (Infrastructure)
- **Cross-chain bridge** - Mocked for demo, use existing solutions in production
- **Protocol integrations** - Start with 3-5 major protocols, expand later
- **Advanced features** - Focus on core optimization, add bells/whistles later

### 🎯 Why This Works for Hackathon
- **Judges see the innovation** - ML algorithm is clearly differentiated
- **Demo is compelling** - Simple inputs → intelligent outputs
- **Technical depth** - Real ML model with backtesting proves capability
- **Market opportunity** - Clear path from demo to $500M+ product
