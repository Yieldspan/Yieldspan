import { StrKey } from '@stellar/stellar-sdk';

const secret = 'SC7EHJHOL3M66S4O4ETV3FNWI4SHJ2Z2WMXT673QODAIOPSENEZTWAAD';
const publicKey = StrKey.encodeEd25519PublicKey(
  StrKey.decodeEd25519SecretSeed(secret)
);
console.log('🔓 Public Key:', publicKey);
