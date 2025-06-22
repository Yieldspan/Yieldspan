import { JsonRpcProvider, Wallet, Contract, parseEther } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { ETH_CONTRACT_ADDRESS, SEPOLIA_RPC_URL } from "./config";

async function testStakeTransaction() {
  try {
    console.log("🧪 Testing Bridge Stake Transaction...");
    
    // Setup provider and wallet
    const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
    const privateKey = process.env.PRIVATE_KEY || "0x6829357e3e9476af5d559939d17ee949a887b62cf13095894e7546b4012bef36";
    const wallet = new Wallet(privateKey, provider);
    
    console.log("👤 Test wallet address:", wallet.address);
    
    // Load contract ABI
    const abiPath = path.resolve(
      __dirname,
      "../artifacts/contracts/ETHStakeBridge.sol/ETHStakeBridge.json"
    );
    const artifact = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
    const contract = new Contract(ETH_CONTRACT_ADDRESS, artifact.abi, wallet);
    
    console.log("📍 Contract address:", ETH_CONTRACT_ADDRESS);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Wallet balance:", balance.toString(), "wei");
    
    if (balance === 0n) {
      console.warn("⚠️ Wallet has no ETH for testing. Need Sepolia testnet ETH.");
      return;
    }
    
    // Test stake amount (0.001 ETH)
    const stakeAmount = parseEther("0.001");
    console.log("🎯 Staking amount:", stakeAmount.toString(), "wei (0.001 ETH)");
    
    // Call stakeETH function  
    console.log("📤 Sending stake transaction...");
    const tx = await contract.stakeETH({ value: stakeAmount });
    console.log("📝 Transaction hash:", tx.hash);
    
    // Wait for confirmation
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);
    
    // Check for events
    if (receipt?.logs) {
      console.log("📋 Transaction logs:", receipt.logs.length);
      receipt.logs.forEach((log: any, index: number) => {
        console.log(`Log ${index}:`, log);
      });
    }
    
    console.log("🎉 Bridge test completed! Check bridge listener for Staked event processing.");
    
  } catch (error) {
    console.error("❌ Bridge test failed:", error);
  }
}

// Run the test
testStakeTransaction();
