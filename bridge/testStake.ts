import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// ABI yükle
const abiPath = "/Users/muhammedakinci/Desktop/Yieldspan-Backend/artifacts/contracts/ETHStakeBridge.sol/ETHStakeBridge.json";
const artifact = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
const ABI = artifact.abi;

// Kontrat bağla
const contract = new ethers.Contract(
  process.env.SEPOLIA_CONTRACT_ADDRESS!,
  ABI,
  wallet
);

// Test stake fonksiyonu
async function stake() {
  const amount = ethers.parseEther("0.01");
  const tx = await contract.stakeETH({ value: amount });
  console.log("🚀 Transaction sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Transaction mined:", receipt.hash);
}

stake().catch((err) => console.error("🚨 Error during stake:", err));
