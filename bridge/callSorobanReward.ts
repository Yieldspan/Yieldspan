import { exec } from "child_process";
import { CONTRACT_ID, SOROBAN_SECRET, STELLAR_NETWORK } from "./config";

export function callSorobanReward(stellarAddress: string, amount: number) {
  const cmd = [
    "stellar contract invoke",
    `--id ${CONTRACT_ID}`,
    `--source ${SOROBAN_SECRET}`,
    `--network ${STELLAR_NETWORK}`,
    `--`,
    `reward_user`,
    `--user ${stellarAddress}`,
    `--reward_amount ${Math.floor(amount)}`
  ].join(" ");

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Soroban call failed:", stderr);
    } else {
      console.log("✅ Soroban reward call success");
    }
  });
}
