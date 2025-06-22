#!/bin/bash

# Yieldspan Bridge Runner
echo "🚀 Starting Yieldspan Bridge..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create one with:"
    echo "SEPOLIA_RPC_URL=your_rpc_url"
    echo "SEPOLIA_CONTRACT_ADDRESS=your_contract_address"
    echo "SOROBAN_SECRET=your_stellar_secret_key"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔗 Starting Bridge Server..."
cd bridge && npx ts-node bridgeServer.ts 