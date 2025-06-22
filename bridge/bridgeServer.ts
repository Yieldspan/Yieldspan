import { JsonRpcProvider, Contract, formatEther, BigNumberish } from "ethers";
import { WebSocketServer, WebSocket } from "ws";
import * as fs from "fs";
import * as path from "path";
import { sendXLMReward, ensureAccountExists, getAccountBalance } from "./stellarReward";
import { ethToStellarMap } from "./addressMap";
import { ETH_CONTRACT_ADDRESS, SEPOLIA_RPC_URL } from "./config";

interface BridgeEvent {
  type: 'stake' | 'reward' | 'error' | 'status' | 'balance' | 'pong' | 'claim_success' | 'claim_error';
  data: any;
  timestamp: number;
}

interface ConnectedClient {
  ws: WebSocket;
  ethAddress?: string;
  stellarAddress?: string;
}

class BridgeServer {
  private wss: WebSocketServer;
  private clients: Set<ConnectedClient> = new Set();
  private provider: JsonRpcProvider;
  private contract!: Contract;

  constructor() {
    this.wss = new WebSocketServer({ port: 8080 });
    this.provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
    this.initializeWebSocket();
    this.initializeEthereumListener();
  }

  private initializeWebSocket(): void {
    console.log("🔗 WebSocket server started on port 8080");
    
    this.wss.on('connection', (ws: WebSocket) => {
      console.log("👋 New client connected");
      
      const client: ConnectedClient = { ws };
      this.clients.add(client);

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          await this.handleClientMessage(client, data);
        } catch (error) {
          console.error("❌ Error handling client message:", error);
        }
      });

      ws.on('close', () => {
        console.log("👋 Client disconnected");
        this.clients.delete(client);
      });

      // Send initial status
      this.sendToClient(client, {
        type: 'status',
        data: { connected: true, bridgeRunning: true },
        timestamp: Date.now()
      });
    });
  }

  private async handleClientMessage(client: ConnectedClient, data: any): Promise<void> {
    switch (data.type) {
      case 'register':
        client.ethAddress = data.ethAddress?.toLowerCase();
        client.stellarAddress = data.stellarAddress;
        
        // Add to address mapping if not exists
        if (client.ethAddress && client.stellarAddress) {
          ethToStellarMap[client.ethAddress] = client.stellarAddress;
          console.log(`📝 Registered mapping: ${client.ethAddress} → ${client.stellarAddress}`);
        }
        break;

      case 'getBalance':
        if (client.stellarAddress) {
          const balance = await getAccountBalance(client.stellarAddress);
          this.sendToClient(client, {
            type: 'balance',
            data: { balance, address: client.stellarAddress },
            timestamp: Date.now()
          });
        }
        break;

      case 'claim':
        await this.handleClaimRequest(client, data);
        break;

      case 'ping':
        this.sendToClient(client, {
          type: 'pong',
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        });
        break;
    }
  }

  private async handleClaimRequest(client: ConnectedClient, data: any): Promise<void> {
    try {
      console.log("\n💰 Yield Claim Request Received:");
      console.log("👤 User:", client.ethAddress);
      console.log("🎯 Stellar Address:", client.stellarAddress);
      console.log("💎 XLM Amount:", data.xlmAmount);

      if (!client.stellarAddress) {
        throw new Error('No Stellar address registered for this client');
      }

      if (!data.xlmAmount || data.xlmAmount <= 0) {
        throw new Error('Invalid claim amount');
      }

      // Ensure the Stellar account exists
      await ensureAccountExists(client.stellarAddress);

      // Send the actual XLM claim reward
      const txHash = await sendXLMReward(client.stellarAddress, data.xlmAmount);
      
      // Broadcast success to all clients
      this.broadcastToClients({
        type: 'claim_success',
        data: {
          user: client.ethAddress,
          stellarAddress: client.stellarAddress,
          xlmAmount: parseFloat(data.xlmAmount.toFixed(7)),
          txHash,
          claimType: 'yield_claim'
        },
        timestamp: Date.now()
      });

      console.log("✅ Yield claim completed successfully!\n");

    } catch (error) {
      console.error("❌ Error processing claim request:", error);
      
      // Send error to the specific client
      this.sendToClient(client, {
        type: 'claim_error',
        data: { 
          message: 'Claim failed', 
          error: error instanceof Error ? error.message : String(error)
        },
        timestamp: Date.now()
      });
    }
  }

  private async initializeEthereumListener(): Promise<void> {
    try {
      console.log("🚀 Initializing Ethereum listener...");
      
      const network = await this.provider.getNetwork();
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
      this.contract = new Contract(ETH_CONTRACT_ADDRESS, artifact.abi, this.provider);

      console.log("🔗 Listening to contract:", ETH_CONTRACT_ADDRESS);
      console.log("🔁 Waiting for Staked events...");

      // Listen for Staked events
      this.contract.on("Staked", async (user: string, amount: BigNumberish) => {
        await this.handleStakeEvent(user, amount);
      });

      console.log("✅ Bridge server is now running. WebSocket on port 8080");

    } catch (error) {
      console.error("❌ Failed to initialize Ethereum listener:", error);
      this.broadcastToClients({
        type: 'error',
        data: { 
          message: 'Failed to initialize Ethereum listener', 
          error: error instanceof Error ? error.message : String(error)
        },
        timestamp: Date.now()
      });
    }
  }

  private async handleStakeEvent(user: string, amount: BigNumberish): Promise<void> {
    try {
      const userAddress = user.toLowerCase();
      const ethAmount = parseFloat(formatEther(amount));
      
      console.log("\n📡 ETH Deposit Event Received:");
      console.log("👤 User:", user);
      console.log("💰 Amount:", ethAmount, "ETH");

      // Broadcast deposit event to all clients
      this.broadcastToClients({
        type: 'stake',
        data: {
          user: userAddress,
          amount: ethAmount,
          txHash: 'pending'
        },
        timestamp: Date.now()
      });

      const stellarAddress = ethToStellarMap[userAddress];
      if (!stellarAddress) {
        console.warn("⚠️ No Stellar address mapped for:", user);
        this.broadcastToClients({
          type: 'error',
          data: { message: `No Stellar address mapped for ${user}` },
          timestamp: Date.now()
        });
        return;
      }

      console.log(`🌠 Mapped Stellar address: ${stellarAddress}`);

      // Ensure the Stellar account exists
      await ensureAccountExists(stellarAddress);

      // Calculate reward (simplified: 1 ETH = 10 XLM)
      const xlmReward = ethAmount * 10;
      
      console.log(`💎 Sending ${xlmReward} XLM to Stellar...`);
      
      // Send actual XLM reward
      const txHash = await sendXLMReward(stellarAddress, xlmReward);
      
      // Broadcast success to all clients
      this.broadcastToClients({
        type: 'reward',
        data: {
          user: userAddress,
          stellarAddress,
          xlmAmount: parseFloat(xlmReward.toFixed(7)), // Ensure consistent formatting
          txHash,
          ethAmount
        },
        timestamp: Date.now()
      });

      console.log("✅ Bridge transaction completed successfully!\n");

    } catch (error) {
      console.error("❌ Error processing Staked event:", error);
      this.broadcastToClients({
        type: 'error',
        data: { 
          message: 'Error processing stake event', 
          error: error instanceof Error ? error.message : String(error)
        },
        timestamp: Date.now()
      });
    }
  }

  private sendToClient(client: ConnectedClient, event: BridgeEvent): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(event));
    }
  }

  private broadcastToClients(event: BridgeEvent): void {
    this.clients.forEach(client => {
      this.sendToClient(client, event);
    });
  }
}

// Start the bridge server
const bridgeServer = new BridgeServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Bridge server shutting down...');
  process.exit(0);
}); 