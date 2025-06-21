import assert from 'assert';
import { Client } from '../yield-vault/bindings/src/index';
import { Address, StrKey } from '@stellar/stellar-sdk';
import 'dotenv/config';

const rawEd25519 = StrKey.decodeEd25519PublicKey('GAMW6O2TZQVHCY533QITPZGJ2AZUOI73JI6WDKHJ5QLD4O6MFBBKPRPV');
const testUser = Address.account(Buffer.from(rawEd25519));

const client = new Client({
  contractId: process.env.CONTRACT_ID!,
  networkPassphrase: process.env.NETWORK_PASSPHRASE!,
  rpcUrl: process.env.RPC_URL!,
});

async function runTests() {
  console.log('🔍 Test 1: should initialize user by depositing 0');

  const initTx = await client.deposit({ user: testUser, amount: 0n });
  await initTx.simulate();

  const balanceTx1 = await client.balance_of({ user: testUser });
  const res1 = await balanceTx1.simulate();
  assert.strictEqual(res1.result, 0n);
  console.log('✅ Passed\n');

  console.log('💸 Test 2: should allow deposit and update balance');
  const depositTx = await client.deposit({ user: testUser, amount: 100n });
  await depositTx.simulate();

  const balanceTx2 = await client.balance_of({ user: testUser });
  const res2 = await balanceTx2.simulate();
  assert.strictEqual(res2.result, 100n);
  console.log('✅ Passed\n');

  console.log('🏦 Test 3: should allow withdraw and update balance');
  const withdrawTx = await client.withdraw({ user: testUser, amount: 50n });
  await withdrawTx.simulate();

  const balanceTx3 = await client.balance_of({ user: testUser });
  const res3 = await balanceTx3.simulate();
  assert.strictEqual(res3.result, 50n);
  console.log('✅ Passed\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
