interface BridgeEvent {
  type: 'stake' | 'reward' | 'error' | 'status' | 'balance' | 'pong';
  data: any;
  timestamp: number;
}

interface BridgeStatus {
  connected: boolean;
  ethConnected: boolean;
  stellarConnected: boolean;
  lastReward?: {
    xlmAmount: number;
    txHash: string;
    timestamp: number;
  };
}

type BridgeEventHandler = (event: BridgeEvent) => void;

class BridgeClient {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, BridgeEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  
  public status: BridgeStatus = {
    connected: false,
    ethConnected: false,
    stellarConnected: false
  };

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket('ws://localhost:8080');
      
      this.ws.onopen = () => {
        console.log('🔗 Connected to bridge server');
        this.status.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connected', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const bridgeEvent: BridgeEvent = JSON.parse(event.data);
          this.handleBridgeEvent(bridgeEvent);
        } catch (error) {
          console.error('❌ Error parsing bridge event:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from bridge server');
        this.status.connected = false;
        this.emit('disconnected', { connected: false });
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Bridge WebSocket error:', error);
      };

    } catch (error) {
      console.error('❌ Failed to connect to bridge:', error);
    }
  }

  private handleBridgeEvent(event: BridgeEvent): void {
    console.log('📡 Bridge event received:', event);
    
    switch (event.type) {
      case 'status':
        this.status = { ...this.status, ...event.data };
        break;
        
      case 'stake':
        this.emit('stake', event.data);
        break;
        
      case 'reward':
        this.status.lastReward = {
          xlmAmount: event.data.xlmAmount,
          txHash: event.data.txHash,
          timestamp: event.timestamp
        };
        this.emit('reward', event.data);
        break;
        
      case 'balance':
        this.emit('balance', event.data);
        break;
        
      case 'error':
        this.emit('error', event.data);
        break;
        
      case 'pong':
        this.emit('pong', event.data);
        break;
    }
  }

  // Register wallet addresses with the bridge
  registerWallets(ethAddress: string, stellarAddress: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'register',
        ethAddress,
        stellarAddress
      }));
      console.log(`📝 Registered wallets: ${ethAddress} → ${stellarAddress}`);
    }
  }

  // Request Stellar balance
  requestBalance(stellarAddress: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'getBalance',
        stellarAddress
      }));
    }
  }

  // Ping the bridge server
  ping(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'ping'
      }));
    }
  }

  // Event handling
  on(eventType: string, handler: BridgeEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: BridgeEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler({ type: eventType as any, data, timestamp: Date.now() }));
    }
  }

  // Clean up
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export singleton instance
export const bridgeClient = new BridgeClient(); 