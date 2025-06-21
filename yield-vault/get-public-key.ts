import 'dotenv/config';
import { Keypair } from '@stellar/stellar-sdk';

const secret = process.env.SOROBAN_SECRET!;
const keypair = Keypair.fromSecret(secret);
console.log('Public key:', keypair.publicKey());
