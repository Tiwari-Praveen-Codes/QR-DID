import { slh_dsa_sha2_128f } from '@noble/post-quantum/slh-dsa.js';
import { sha256 } from '@noble/hashes/sha2.js';

export interface SphincsKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  publicKeyHex: string;
  secretKeyHex: string;
  algorithm: string;
  securityLevel: string;
}

export interface SphincsSignature {
  signature: Uint8Array;
  signatureHex: string;
  messageHash: string;
  timestamp: number;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateKeyPair(): Promise<SphincsKeyPair> {
  const seed = crypto.getRandomValues(new Uint8Array(48));
  const { publicKey, secretKey } = slh_dsa_sha2_128f.keygen(seed);
  
  return {
    publicKey,
    secretKey,
    publicKeyHex: toHex(publicKey),
    secretKeyHex: toHex(secretKey.slice(0, 32)) + '...[REDACTED]',
    algorithm: 'SLH-DSA-SHA2-128f (SPHINCS+)',
    securityLevel: 'NIST Level 1 (128-bit post-quantum)',
  };
}

export async function signMessage(message: Uint8Array, secretKey: Uint8Array): Promise<SphincsSignature> {
  const signature = slh_dsa_sha2_128f.sign(secretKey, message);
  const hashBytes = sha256(message);
  const messageHash = toHex(hashBytes);
  
  return {
    signature,
    signatureHex: toHex(signature.slice(0, 64)) + '...',
    messageHash,
    timestamp: Date.now(),
  };
}

export function verifySignature(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
  try {
    return slh_dsa_sha2_128f.verify(publicKey, message, signature);
  } catch {
    return false;
  }
}
