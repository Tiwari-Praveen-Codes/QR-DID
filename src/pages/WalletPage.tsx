import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Key, Fingerprint, Send, Loader2 } from 'lucide-react';
import QRProofDisplay from '@/components/QRProofDisplay';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import CredentialCard from '@/components/CredentialCard';
import ConsoleOutput from '@/components/ConsoleOutput';
import { generateKeyPair, type SphincsKeyPair } from '@/lib/crypto/sphincs';
import { generateDID, generateBlockchainRecord, type DIDDocument } from '@/lib/crypto/did';
import { generateZKProof, type ZKProofResult, type CredentialField } from '@/lib/crypto/zkproof';

const INITIAL_FIELDS: CredentialField[] = [
  { name: 'Full Name', value: 'Arjun Krishnamurthy', disclosed: false },
  { name: 'Date of Birth', value: '1998-03-15', disclosed: false },
  { name: 'Nationality', value: 'Indian', disclosed: false },
  { name: 'Document Number', value: 'J8294756', disclosed: false },
  { name: 'Age Verified', value: 'Over 18 ✓', disclosed: true },
  { name: 'Credential Expiry', value: '2029-12-31', disclosed: false },
];

type LogLine = { type: 'info' | 'success' | 'warn' | 'data'; text: string };

export default function WalletPage() {
  const [fields, setFields] = useState<CredentialField[]>(INITIAL_FIELDS);
  const [keyPair, setKeyPair] = useState<SphincsKeyPair | null>(null);
  const [did, setDid] = useState<DIDDocument | null>(null);
  const [proof, setProof] = useState<ZKProofResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [keyGenLoading, setKeyGenLoading] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([
    { type: 'info', text: 'QR-DID Wallet initialized' },
    { type: 'info', text: 'Waiting for SPHINCS+ key generation...' },
  ]);

  // Store proof in ref for verifier page access
  const proofRef = useRef<ZKProofResult | null>(null);

  const addLog = useCallback((line: LogLine) => {
    setLogs(prev => [...prev, line]);
  }, []);

  const handleGenerateKeys = useCallback(async () => {
    setKeyGenLoading(true);
    addLog({ type: 'info', text: 'Generating SPHINCS+ keypair (SLH-DSA-SHA2-128f)...' });
    addLog({ type: 'warn', text: 'This uses real post-quantum cryptography — may take a moment' });

    // Use setTimeout to allow UI to update before heavy computation
    await new Promise(r => setTimeout(r, 100));

    try {
      const kp = await generateKeyPair();
      setKeyPair(kp);

      addLog({ type: 'success', text: 'SPHINCS+ keypair generated successfully' });
      addLog({ type: 'data', text: `Algorithm: ${kp.algorithm}` });
      addLog({ type: 'data', text: `Security: ${kp.securityLevel}` });
      addLog({ type: 'data', text: `Public key: ${kp.publicKeyHex.slice(0, 64)}...` });
      addLog({ type: 'data', text: `Secret key: ${kp.secretKeyHex}` });

      const didDoc = generateDID(kp);
      setDid(didDoc);
      addLog({ type: 'success', text: `DID generated: ${didDoc.id}` });
      addLog({ type: 'data', text: `Verification method: ${didDoc.verificationMethod[0].type}` });

      const blockchainRecord = generateBlockchainRecord(didDoc, '0x...');
      addLog({ type: 'info', text: `Blockchain anchor: ${blockchainRecord.network}` });
      addLog({ type: 'data', text: `TX: ${blockchainRecord.transactionHash.slice(0, 32)}...` });
      addLog({ type: 'data', text: `Block: ${blockchainRecord.blockNumber}` });
    } catch (err) {
      addLog({ type: 'warn', text: `Key generation failed: ${err}` });
    } finally {
      setKeyGenLoading(false);
    }
  }, [addLog]);

  const handleToggleField = useCallback((index: number) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, disclosed: !f.disclosed } : f));
  }, []);

  const handleGenerateProof = useCallback(async () => {
    if (!keyPair) return;
    const disclosed = fields.filter(f => f.disclosed);
    if (disclosed.length === 0) {
      addLog({ type: 'warn', text: 'Select at least one field to disclose' });
      return;
    }

    setGenerating(true);
    addLog({ type: 'info', text: '--- ZK Proof Generation ---' });
    addLog({ type: 'info', text: `Disclosed fields: ${disclosed.map(f => f.name).join(', ')}` });
    addLog({ type: 'info', text: `Redacted fields: ${fields.filter(f => !f.disclosed).map(f => f.name).join(', ')}` });
    addLog({ type: 'info', text: 'Building Merkle credential tree...' });

    await new Promise(r => setTimeout(r, 100));

    try {
      const result = await generateZKProof(fields, keyPair);
      setProof(result);
      proofRef.current = result;

      // Store proof in sessionStorage for verifier page
      sessionStorage.setItem('qrdid_proof', JSON.stringify({
        proof: {
          merkleRoot: result.proof.merkleRoot,
          disclosedProofs: result.proof.disclosedProofs,
          nullifier: result.proof.nullifier,
          commitment: result.proof.commitment,
          protocol: result.proof.protocol,
          curve: result.proof.curve,
        },
        sphincsSignature: {
          signatureHex: result.sphincsSignature.signatureHex,
          messageHash: result.sphincsSignature.messageHash,
          timestamp: result.sphincsSignature.timestamp,
        },
        metadata: result.metadata,
        publicKeyHex: keyPair.publicKeyHex,
      }));
      // Also store raw data for actual verification
      sessionStorage.setItem('qrdid_raw', JSON.stringify({
        publicKey: Array.from(keyPair.publicKey),
        signature: Array.from(result.sphincsSignature.signature),
        fields: fields,
      }));

      addLog({ type: 'success', text: `Merkle root: ${result.proof.merkleRoot.slice(0, 32)}...` });
      addLog({ type: 'data', text: `Nullifier: ${result.proof.nullifier.slice(0, 32)}...` });
      addLog({ type: 'data', text: `Commitment: ${result.proof.commitment.slice(0, 32)}...` });
      addLog({ type: 'data', text: `SPHINCS+ signature: ${result.sphincsSignature.signatureHex}` });
      addLog({ type: 'success', text: `Proof generated in ${result.metadata.generationTimeMs.toFixed(0)}ms` });
      addLog({ type: 'data', text: `Proof size: ${(result.metadata.proofSize / 1024).toFixed(1)} KB` });
      addLog({ type: 'success', text: 'Proof stored — ready to submit to verifier' });
    } catch (err) {
      addLog({ type: 'warn', text: `Proof generation failed: ${err}` });
    } finally {
      setGenerating(false);
    }
  }, [keyPair, fields, addLog]);

  const disclosedCount = fields.filter(f => f.disclosed).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pb-16 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Identity Wallet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Self-sovereign, quantum-resistant credential management
          </p>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Left column — Credential + actions */}
          <div className="space-y-6">
            {/* Key generation */}
            {!keyPair ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-dashed border-border bg-gradient-card p-8 text-center"
                data-tour="keygen-section"
              >
                <Key className="mx-auto h-10 w-10 text-primary/40" />
                <h3 className="mt-4 text-base font-semibold text-foreground">Generate SPHINCS+ Keypair</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a post-quantum keypair to sign and anchor your identity
                </p>
                <Button
                  onClick={handleGenerateKeys}
                  disabled={keyGenLoading}
                  className="mt-6 bg-gradient-quantum text-primary-foreground shadow-glow hover:opacity-90"
                >
                  {keyGenLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Generate Keypair
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <>
                {/* DID badge */}
                {did && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3"
                  >
                    <p className="text-xs text-muted-foreground">Your DID</p>
                    <p className="mt-0.5 break-all font-mono text-xs font-medium text-primary">
                      {did.id}
                    </p>
                  </motion.div>
                )}

                {/* Credential card */}
                <div data-tour="credential-card">
                  <CredentialCard
                    fields={fields}
                    onToggleField={handleToggleField}
                    generating={generating}
                  />
                </div>

                {/* Generate proof button */}
                <Button
                  onClick={handleGenerateProof}
                  disabled={generating || disclosedCount === 0}
                  size="lg"
                  className="w-full bg-gradient-quantum text-primary-foreground shadow-glow hover:opacity-90 disabled:opacity-40"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating ZK Proof...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Proof ({disclosedCount} field{disclosedCount !== 1 ? 's' : ''} disclosed)
                    </>
                  )}
                </Button>

                {proof && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-center"
                    >
                      <p className="text-sm font-medium text-success">
                        ✓ Proof ready — scan QR on Verifier or navigate there directly
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Generated in {proof.metadata.generationTimeMs.toFixed(0)}ms
                      </p>
                    </motion.div>

                    <QRProofDisplay
                      proofPayload={JSON.stringify({
                        r: proof.proof.merkleRoot,
                        n: proof.proof.nullifier,
                        c: proof.proof.commitment,
                        d: proof.metadata.disclosedFields,
                        x: proof.metadata.redactedFields,
                        t: proof.metadata.generatedAt,
                        p: proof.proof.protocol,
                        s: proof.sphincsSignature.signatureHex,
                      })}
                    />
                  </>
                )}
              </>
            )}
          </div>

          {/* Right column — Console */}
          <div>
            <ConsoleOutput lines={logs} title="QR-DID Crypto Console" />
          </div>
        </div>
      </div>
    </div>
  );
}
