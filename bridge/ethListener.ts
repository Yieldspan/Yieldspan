import { JsonRpcProvider, Contract, formatEther, BigNumberish } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { callSorobanReward } from "./callSorobanReward";
import { ethToStellarMap } from "./addressMap";
import { ETH_CONTRACT_ADDRESS, SEPOLIA_RPC_URL } from "./config";

async function startBridgeListener() {
  try {
    console.log("🚀 Starting Bridge Listener...");
    
    const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);

    // Test provider connection
    const network = await provider.getNetwork();
    console.log("🌐 Connected to network:", network.name, `(Chain ID: ${network.chainId})`);

    // Load contract ABI
    const abiPath = path.resolve(
      __dirname,
      "../artifacts/contracts/ETHStakeBridge.sol/ETHStakeBridge.json"
    );

    if (!fs.existsSync(abiPath)) {
      throw new Error(`Contract ABI not found at: ${abiPath}`);
    }

    const artifact = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
    const ABI = artifact.abi;

    console.log("📄 Contract ABI loaded successfully");

    // Validate contract address
    if (!ETH_CONTRACT_ADDRESS) {
      throw new Error("ETH_CONTRACT_ADDRESS is not configured");
    }

    // Create contract instance
    const contract = new Contract(ETH_CONTRACT_ADDRESS, ABI, provider);

    console.log("🔗 Listening to contract:", ETH_CONTRACT_ADDRESS);
    console.log("🔁 Waiting for Staked events...");

    // Listen for Staked events
    contract.on("Staked", async (user: string, amount: BigNumberish) => {
      try {
        console.log("\n📡 ETH Stake Event Received:");
        console.log("👤 User:", user);
        console.log("💰 Amount:", formatEther(amount), "ETH");

        const stellarAddress = ethToStellarMap[user.toLowerCase()];
        if (!stellarAddress) {
          console.warn("⚠️ No Stellar address mapped for:", user);
          return;
        }

        console.log(`🌠 Mapped Stellar address: ${stellarAddress}`);

        const ethAmount = parseFloat(formatEther(amount));
        const reward = ethAmount * 100; // 100x multiplier for demo

        console.log(`💎 Sending ${reward} reward tokens to Stellar...`);
        
        await callSorobanReward(stellarAddress, reward);
        
        console.log("✅ Bridge transaction completed successfully!\n");
      } catch (error) {
        console.error("❌ Error processing Staked event:", error);
      }
    });

    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Bridge listener shutting down...');
      process.exit(0);
    });

    console.log("✅ Bridge listener is now running. Press Ctrl+C to stop.");

  } catch (error) {
    console.error("❌ Failed to start bridge listener:", error);
    process.exit(1);
  }
}

// Start the listener
startBridgeListener();
