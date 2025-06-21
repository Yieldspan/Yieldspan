import * as dotenv from 'dotenv';
dotenv.config();

import StellarSdk from 'stellar-sdk'; 

const senderSecret = process.env.STELLAR_REWARD_SENDER_SECRET!;
const receiverPublic = process.env.STELLAR_REWARD_RECEIVER!;

const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

async function sendReward() {
  const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
  const account = await server.loadAccount(senderKeypair.publicKey());

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(StellarSdk.Operation.payment({
      destination: receiverPublic,
      asset: StellarSdk.Asset.native(),
      amount: "1.0",
    }))
    .setTimeout(30)
    .build();

  transaction.sign(senderKeypair);
  const result = await server.submitTransaction(transaction);
  console.log("✅ XLM gönderildi! TX hash:", result.hash);
}

sendReward().catch((err) => {
  console.error("❌ Gönderim hatası:", err.response?.data || err);
});
