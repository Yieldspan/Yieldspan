import { 
  Horizon, 
  Keypair, 
  TransactionBuilder, 
  Networks, 
  Operation, 
  Asset 
} from 'stellar-sdk';
import { SOROBAN_SECRET, STELLAR_NETWORK } from './config';

const server = new Horizon.Server(STELLAR_NETWORK === 'testnet' 
  ? 'https://horizon-testnet.stellar.org' 
  : 'https://horizon.stellar.org'
);

const networkPassphrase = STELLAR_NETWORK === 'testnet' 
  ? Networks.TESTNET 
  : Networks.PUBLIC;

export async function sendXLMReward(stellarAddress: string, xlmAmount: number): Promise<string> {
  try {
    console.log(`💫 Sending ${xlmAmount} XLM to ${stellarAddress}...`);
    
    // Validate and format amount to meet Stellar requirements
    if (xlmAmount <= 0) {
      throw new Error(`Invalid XLM amount: ${xlmAmount}. Must be positive.`);
    }
    
    // Load the source account (reward distributor)
    const sourceKeypair = Keypair.fromSecret(SOROBAN_SECRET);
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    
    // Format amount to max 7 decimal places (Stellar requirement)
    // Use parseFloat to remove trailing zeros after toFixed
    const formattedAmount = parseFloat(xlmAmount.toFixed(7)).toString();
    
    console.log(`📐 Formatted amount: ${xlmAmount} → ${formattedAmount} XLM`);
    
    // Build the payment transaction
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100000', // 0.01 XLM fee
      networkPassphrase
    })
    .addOperation(
      Operation.payment({
        destination: stellarAddress,
        asset: Asset.native(), // XLM
        amount: formattedAmount
      })
    )
    .setTimeout(180) // 3 minutes timeout
    .build();
    
    // Sign and submit transaction
    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);
    
    console.log(`✅ XLM reward sent! Transaction: ${result.hash}`);
    return result.hash;
    
  } catch (error) {
    console.error('❌ Failed to send XLM reward:', error);
    throw error;
  }
}

// Function to check account balance
export async function getAccountBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(balance => 
      balance.asset_type === 'native'
    );
    return xlmBalance ? xlmBalance.balance : '0';
  } catch (error) {
    console.error('❌ Failed to get account balance:', error);
    return '0';
  }
}

// Function to ensure account exists (create if needed)
export async function ensureAccountExists(publicKey: string): Promise<void> {
  try {
    await server.loadAccount(publicKey);
    console.log(`✅ Account ${publicKey} exists`);
  } catch (error) {
    console.log(`🔄 Creating account ${publicKey}...`);
    
    const sourceKeypair = Keypair.fromSecret(SOROBAN_SECRET);
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100000',
      networkPassphrase
    })
    .addOperation(
      Operation.createAccount({
        destination: publicKey,
        startingBalance: '1' // 1 XLM minimum
      })
    )
    .setTimeout(180)
    .build();
    
    transaction.sign(sourceKeypair);
    await server.submitTransaction(transaction);
    console.log(`✅ Account created for ${publicKey}`);
  }
} 