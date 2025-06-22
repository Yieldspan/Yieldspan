import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/1251d108ba734be5a2cefd0b8db1c78d";
export const ETH_CONTRACT_ADDRESS = process.env.SEPOLIA_CONTRACT_ADDRESS || "0x2F4925f1e6A354C7e9d54175A586FE999d08d8D8";
export const SOROBAN_SECRET = process.env.SOROBAN_SECRET || "SC7EHJHOL3M66S4O4ETV3FNWI4SHJ2Z2WMXT673QODAIOPSENEZTWAAD";
export const RPC_URL = process.env.RPC_URL || "https://soroban-testnet.stellar.org";
export const CONTRACT_ID = process.env.CONTRACT_ID || "CC5K75G7UM6LNBV4ISEFEMYGPHC4AUNO72WVJWYTY777RJ3622P7WVGQ";
export const STELLAR_NETWORK = process.env.STELLAR_NETWORK || "testnet";

// Validate required config
if (!ETH_CONTRACT_ADDRESS) {
  throw new Error("SEPOLIA_CONTRACT_ADDRESS is required");
}

console.log("🔧 Bridge Config Loaded:");
console.log("📍 ETH Contract Address:", ETH_CONTRACT_ADDRESS);
console.log("🌐 Sepolia RPC:", SEPOLIA_RPC_URL);
console.log("⭐ Stellar Network:", STELLAR_NETWORK);
