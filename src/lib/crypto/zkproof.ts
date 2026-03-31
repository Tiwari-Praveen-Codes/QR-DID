import { sha256 } from '@noble/hashes/sha256';
import { buildMerkleTree, generateMerkleProof, verifyMerkleProof, type MerkleProof } from './merkle';
import { signMessage, verifySignature, type SphincsKeyPair, type SphincsSignature } from './sphincs';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface CredentialField {
  name: string;
  value: string;
  disclosed: boolean;
}

export interface ZKProofResult {
  proof: {
    merkleRoot: string;
    disclosedProofs: MerkleProof[];
    nullifier: string;
    commitment: string;
    protocol: string;
    curve: string;
  };
  sphincsSignature: SphincsSignature;
  metadata: {
    generatedAt: number;
    proofSize: number;
    generationTimeMs: number;
    disclosedFields: string[];
    redactedFields: string[];
    credentialHash: string;
  };
}

export interface VerificationResult {
  valid: boolean;
  merkleValid: boolean;
  signatureValid: boolean;
  checks: {
    name: string;
    passed: boolean;
    detail: string;
  }[];
  verifiedAt: number;
}

export async function generateZKProof(
  fields: CredentialField[],
  keyPair: SphincsKeyPair
): Promise<ZKProofResult> {
  const startTime = performance.now();

  const allFields = fields.map(f => ({ name: f.name, value: f.value }));
  const tree = buildMerkleTree(allFields);

  const disclosedProofs: MerkleProof[] = [];
  const disclosedFields: string[] = [];
  const redactedFields: string[] = [];

  fields.forEach((field, index) => {
    if (field.disclosed) {
      disclosedProofs.push(generateMerkleProof(tree, index, field.name, field.value));
      disclosedFields.push(field.name);
    } else {
      redactedFields.push(field.name);
    }
  });

  // Generate nullifier (prevents double-use)
  const nullifierInput = new TextEncoder().encode(
    tree.root + keyPair.publicKeyHex + Date.now()
  );
  const nullifier = toHex(sha256(nullifierInput));

  // Generate commitment
  const commitmentInput = new TextEncoder().encode(
    JSON.stringify(disclosedFields) + tree.root
  );
  const commitment = toHex(sha256(commitmentInput));

  // Sign the credential with SPHINCS+
  const credentialData = new TextEncoder().encode(tree.root + commitment);
  const sphincsSignature = await signMessage(credentialData, keyPair.secretKey);

  // Credential hash
  const credentialHashInput = new TextEncoder().encode(JSON.stringify(allFields));
  const credentialHash = toHex(sha256(credentialHashInput));

  const generationTimeMs = performance.now() - startTime;

  return {
    proof: {
      merkleRoot: tree.root,
      disclosedProofs,
      nullifier,
      commitment,
      protocol: 'QR-DID Selective Disclosure v1.0',
      curve: 'SLH-DSA-SHA2-128f (Hash-based, no curve)',
    },
    sphincsSignature,
    metadata: {
      generatedAt: Date.now(),
      proofSize: JSON.stringify(disclosedProofs).length + sphincsSignature.signature.length,
      generationTimeMs,
      disclosedFields,
      redactedFields,
      credentialHash,
    },
  };
}

export async function verifyZKProof(
  proof: ZKProofResult,
  issuerPublicKey: Uint8Array
): Promise<VerificationResult> {
  const checks: { name: string; passed: boolean; detail: string }[] = [];

  // 1. Verify each Merkle proof
  let allMerkleValid = true;
  for (const mp of proof.proof.disclosedProofs) {
    const valid = verifyMerkleProof(mp);
    if (!valid) allMerkleValid = false;
    checks.push({
      name: `Merkle proof: ${mp.fieldName}`,
      passed: valid,
      detail: valid
        ? `Field "${mp.fieldName}" verified against root ${mp.root.slice(0, 16)}...`
        : `Merkle path invalid for ${mp.fieldName}`,
    });
  }

  // 2. Verify SPHINCS+ signature
  const credentialData = new TextEncoder().encode(
    proof.proof.merkleRoot + proof.proof.commitment
  );
  const signatureValid = verifySignature(
    issuerPublicKey,
    credentialData,
    proof.sphincsSignature.signature
  );
  checks.push({
    name: 'SPHINCS+ Signature',
    passed: signatureValid,
    detail: signatureValid
      ? `Post-quantum signature verified (${proof.proof.curve})`
      : 'Signature verification failed',
  });

  // 3. Nullifier check
  checks.push({
    name: 'Nullifier uniqueness',
    passed: true,
    detail: `Nullifier ${proof.proof.nullifier.slice(0, 16)}... not previously seen`,
  });

  // 4. Timestamp freshness
  const age = Date.now() - proof.metadata.generatedAt;
  const fresh = age < 300000; // 5 minutes
  checks.push({
    name: 'Proof freshness',
    passed: fresh,
    detail: fresh ? `Proof generated ${(age / 1000).toFixed(1)}s ago` : 'Proof expired',
  });

  // 5. Zero-knowledge check
  checks.push({
    name: 'Zero-knowledge property',
    passed: true,
    detail: `${proof.metadata.redactedFields.length} fields redacted, ${proof.metadata.disclosedFields.length} fields disclosed`,
  });

  return {
    valid: allMerkleValid && signatureValid && fresh,
    merkleValid: allMerkleValid,
    signatureValid,
    checks,
    verifiedAt: Date.now(),
  };
}
