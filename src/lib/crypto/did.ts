import type { SphincsKeyPair } from './sphincs';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyHex: string;
  }[];
  authentication: string[];
  created: string;
  algorithm: string;
}

export function generateDID(keyPair: SphincsKeyPair): DIDDocument {
  const pkHash = toHex(keyPair.publicKey.slice(0, 20));
  const did = `did:qrdid:${pkHash}`;

  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/jws-2020/v1',
    ],
    id: did,
    controller: did,
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: 'SLH-DSA-SHA2-128f',
        controller: did,
        publicKeyHex: keyPair.publicKeyHex,
      },
    ],
    authentication: [`${did}#key-1`],
    created: new Date().toISOString(),
    algorithm: keyPair.algorithm,
  };
}

export function generateBlockchainRecord(did: DIDDocument, merkleRoot: string) {
  const txHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const blockNumber = 18_000_000 + Math.floor(Math.random() * 100000);

  return {
    transactionHash: txHash,
    blockNumber,
    network: 'Ethereum Sepolia (Testnet)',
    contract: '0x7a23...DIDRegistry',
    method: 'registerDID(bytes32,bytes)',
    args: {
      didHash: did.id,
      merkleRoot,
    },
    gasUsed: '142,847',
    timestamp: new Date().toISOString(),
    status: 'confirmed' as const,
  };
}
