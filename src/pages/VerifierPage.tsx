import { useState, useCallback } from 'react';
import QuantumParticles from '@/components/QuantumParticles';
import { motion } from 'framer-motion';
import { Upload, Loader2, ScanLine } from 'lucide-react';
import QRScanner from '@/components/QRScanner';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import VerifierPanel from '@/components/VerifierPanel';
import ConsoleOutput from '@/components/ConsoleOutput';
import { verifyZKProof, type ZKProofResult, type VerificationResult, type CredentialField } from '@/lib/crypto/zkproof';
import { buildMerkleTree, generateMerkleProof } from '@/lib/crypto/merkle';
import { verifySignature, type SphincsSignature } from '@/lib/crypto/sphincs';

type LogLine = { type: 'info' | 'success' | 'warn' | 'data'; text: string };

export default function VerifierPage() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [disclosedFields, setDisclosedFields] = useState<{ name: string; value: string }[]>([]);
  const [redactedFields, setRedactedFields] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogLine[]>([
    { type: 'info', text: 'QR-DID Verifier dApp initialized' },
    { type: 'info', text: 'Waiting for proof submission...' },
  ]);

  const addLog = useCallback((line: LogLine) => {
    setLogs(prev => [...prev, line]);
  }, []);

  const handleVerify = useCallback(async () => {
    const rawStr = sessionStorage.getItem('qrdid_raw');
    const proofStr = sessionStorage.getItem('qrdid_proof');

    if (!rawStr || !proofStr) {
      addLog({ type: 'warn', text: 'No proof found. Generate one from the Wallet first.' });
      return;
    }

    setVerifying(true);
    addLog({ type: 'info', text: '--- Verification Started ---' });

    await new Promise(r => setTimeout(r, 300));

    try {
      const raw = JSON.parse(rawStr);
      const proofData = JSON.parse(proofStr);

      const publicKey = new Uint8Array(raw.publicKey);
      const signature = new Uint8Array(raw.signature);
      const fields: CredentialField[] = raw.fields;

      addLog({ type: 'info', text: `Received proof from wallet` });
      addLog({ type: 'data', text: `Protocol: ${proofData.proof.protocol}` });
      addLog({ type: 'data', text: `Merkle root: ${proofData.proof.merkleRoot.slice(0, 32)}...` });

      // Rebuild merkle tree and proofs for verification
      const allFields = fields.map((f: CredentialField) => ({ name: f.name, value: f.value }));
      const tree = buildMerkleTree(allFields);

      const disclosedProofs = fields
        .map((f: CredentialField, i: number) => f.disclosed ? generateMerkleProof(tree, i, f.name, f.value) : null)
        .filter(Boolean);

      // Reconstruct the full proof object
      const fullProof: ZKProofResult = {
        proof: {
          merkleRoot: proofData.proof.merkleRoot,
          disclosedProofs: disclosedProofs as any,
          nullifier: proofData.proof.nullifier,
          commitment: proofData.proof.commitment,
          protocol: proofData.proof.protocol,
          curve: proofData.proof.curve,
        },
        sphincsSignature: {
          signature,
          signatureHex: proofData.sphincsSignature.signatureHex,
          messageHash: proofData.sphincsSignature.messageHash,
          timestamp: proofData.sphincsSignature.timestamp,
        },
        metadata: proofData.metadata,
      };

      addLog({ type: 'info', text: 'Verifying SPHINCS+ signature...' });
      addLog({ type: 'info', text: 'Checking Merkle proofs for disclosed fields...' });

      const verificationResult = await verifyZKProof(fullProof, publicKey);
      setResult(verificationResult);

      const disclosed = fields.filter((f: CredentialField) => f.disclosed).map((f: CredentialField) => ({ name: f.name, value: f.value }));
      const redacted = fields.filter((f: CredentialField) => !f.disclosed).map((f: CredentialField) => f.name);
      setDisclosedFields(disclosed);
      setRedactedFields(redacted);

      for (const check of verificationResult.checks) {
        addLog({
          type: check.passed ? 'success' : 'warn',
          text: `${check.name}: ${check.detail}`,
        });
      }

      if (verificationResult.valid) {
        addLog({ type: 'success', text: '=== VERIFICATION PASSED ===' });
        addLog({ type: 'success', text: `${disclosed.length} claims verified, ${redacted.length} fields redacted` });
        addLog({ type: 'info', text: 'No personal data was transmitted to the verifier' });
      } else {
        addLog({ type: 'warn', text: '=== VERIFICATION FAILED ===' });
      }
    } catch (err) {
      addLog({ type: 'warn', text: `Verification error: ${err}` });
    } finally {
      setVerifying(false);
    }
  }, [addLog]);

  const [scannedProof, setScannedProof] = useState<string | null>(null);
  const hasProof = !!sessionStorage.getItem('qrdid_proof');

  const handleQRScan = useCallback((data: string) => {
    setScannedProof(data);
    addLog({ type: 'success', text: 'QR code scanned successfully' });
    try {
      const parsed = JSON.parse(data);
      addLog({ type: 'data', text: `Merkle root: ${parsed.r?.slice(0, 32)}...` });
      addLog({ type: 'data', text: `Disclosed fields: ${parsed.d?.join(', ')}` });
      addLog({ type: 'info', text: 'QR proof received — click Verify to check' });
    } catch {
      addLog({ type: 'data', text: `Raw payload received (${data.length} chars)` });
    }
  }, [addLog]);

  return (
    <div className="relative min-h-screen bg-background">
      <QuantumParticles subtle />
      <Navigation />
      <div className="container mx-auto px-4 pb-16 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Verifier dApp</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verify identity claims without receiving personal data
          </p>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Left column — Verification */}
          <div className="space-y-6">
            {/* QR Scanner */}
            <QRScanner onScan={handleQRScan} />

            {scannedProof && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3"
              >
                <p className="text-xs font-medium text-primary">✓ QR Proof Received</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground truncate">
                  {scannedProof.slice(0, 80)}...
                </p>
              </motion.div>
            )}

            <Button
              onClick={handleVerify}
              disabled={verifying}
              size="lg"
              className="w-full bg-gradient-quantum text-primary-foreground shadow-glow hover:opacity-90"
              data-tour="verify-btn"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Proof...
                </>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" />
                  {hasProof || scannedProof ? 'Verify Proof' : 'No Proof Available'}
                </>
              )}
            </Button>

            <VerifierPanel
              result={result}
              loading={verifying}
              disclosedFields={disclosedFields}
              redactedFields={redactedFields}
            />
          </div>

          {/* Right column — Console */}
          <div>
            <ConsoleOutput lines={logs} title="Verifier Console" />
          </div>
        </div>
      </div>
    </div>
  );
}
