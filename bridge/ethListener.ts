import { JsonRpcProvider, Contract, formatEther, BigNumberish } from "ethers";
import fs from "fs";
import path from "path";
import { callSorobanReward } from "./callSorobanReward";
import { ethToStellarMap } from "./addressMap";
import { ETH_CONTRACT_ADDRESS, SEPOLIA_RPC_URL } from "./config";

const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);

// ✅ ABI dosyasının yolu
const abiPath = path.resolve(
  __dirname,
  "../artifacts/contracts/ETHStakeBridge.sol/ETHStakeBridge.json"
);
const artifact = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
const ABI = artifact.abi;

const contract = new Contract(ETH_CONTRACT_ADDRESS, ABI, provider);

console.log("🔗 Listening to contract:", ETH_CONTRACT_ADDRESS);
console.log("🔁 Waiting for Staked events...");

contract.on("Staked", async (user: string, amount: BigNumberish) => {
  console.log("📡 ETH Stake Event:");
  console.log("👤 User:", user);
  console.log("💰 Amount:", formatEther(amount));

  const stellarAddress = ethToStellarMap[user.toLowerCase()];
  if (!stellarAddress) {
    console.warn("⚠️ No Stellar address mapped for:", user);
    return;
  }

  console.log(`🌠 Mapped Stellar address: ${stellarAddress}`);

  const ethAmount = parseFloat(formatEther(amount));
  const reward = ethAmount * 100;

  callSorobanReward(stellarAddress, reward);
});
