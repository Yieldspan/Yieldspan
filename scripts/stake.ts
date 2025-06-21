import { ethers } from "ethers";
import * as dotenv from "dotenv";
import ETHStakeBridge from "../artifacts/contracts/ETHStakeBridge.sol/ETHStakeBridge.json";

dotenv.config();

const STAKE_AMOUNT = "0.001"; 

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

    console.log(`⛏ Staking ${STAKE_AMOUNT} ETH...`);

    const contractAddress = "0x4Ac044c4a9e623B4261D4099Fc78C29d9B2F02D5"; 
    const contract = new ethers.Contract(contractAddress, ETHStakeBridge.abi, wallet);

    const tx = await contract.stakeETH({ value: ethers.parseEther(STAKE_AMOUNT) });
    await tx.wait();

    console.log("✅ Stake successful. Transaction hash:", tx.hash);
  } catch (err) {
    console.error("❌ Error during stake:", err);
  }
}

main();
