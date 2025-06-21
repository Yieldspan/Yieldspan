import { Wallet, ContractFactory } from "ethers";
import { JsonRpcProvider } from "ethers";
import { formatEther } from "ethers";
import * as dotenv from "dotenv";
import contractJson from "../artifacts/contracts/ETHStakeBridge.sol/ETHStakeBridge.json";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const INFURA_URL = "https://sepolia.infura.io/v3/1251d108ba734be5a2cefd0b8db1c78d";

async function main() {
  const provider = new JsonRpcProvider(INFURA_URL);
  const wallet = new Wallet(PRIVATE_KEY, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Wallet Balance: ${formatEther(balance)} ETH`);

  const factory = new ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );

  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("🚀 Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
