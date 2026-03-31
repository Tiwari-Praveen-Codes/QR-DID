import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { VerificationResult } from '@/lib/crypto/zkproof';

interface VerifierPanelProps {
  result: VerificationResult | null;
  loading: boolean;
  disclosedFields: { name: string; value: string }[];
  redactedFields: string[];
}

export default function VerifierPanel({ result, loading, disclosedFields, redactedFields }: VerifierPanelProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-border bg-gradient-card p-12 shadow-card"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Verifying proof...</p>
        <p className="mt-1 text-xs text-muted-foreground">Checking SPHINCS+ signature & Merkle paths</p>
      </motion.div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-gradient-card p-12">
        <ShieldCheck className="h-12 w-12 text-muted-foreground/30" />
        <p className="mt-4 text-sm text-muted-foreground">No proof submitted yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Generate a proof from the Wallet and submit it here</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-card"
    >
      {/* Result banner */}
      <div className={`flex items-center gap-3 px-6 py-5 ${
        result.valid ? 'bg-success/10' : 'bg-destructive/10'
      }`}>
        {result.valid ? (
          <CheckCircle className="h-8 w-8 text-success" />
        ) : (
          <XCircle className="h-8 w-8 text-destructive" />
        )}
        <div>
          <h3 className={`text-lg font-bold ${result.valid ? 'text-success' : 'text-destructive'}`}>
            {result.valid ? 'VERIFIED' : 'REJECTED'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {result.valid
              ? 'Credential claim verified with post-quantum signature'
              : 'Verification failed — signature or proof invalid'}
          </p>
        </div>
      </div>

      {/* Disclosed claims */}
      <div className="border-t border-border px-6 py-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Verified Claims
        </h4>
        <div className="space-y-2">
          {disclosedFields.map(f => (
            <div key={f.name} className="flex items-center justify-between rounded-lg bg-success/5 px-4 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">{f.name}</span>
              <span className="text-sm font-semibold text-success">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Redacted fields */}
      <div className="border-t border-border px-6 py-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Data NOT Received
        </h4>
        <div className="flex flex-wrap gap-2">
          {redactedFields.map(name => (
            <div key={name} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
              <AlertTriangle className="h-3 w-3 text-warning" />
              <span className="text-xs font-medium text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verification checks */}
      <div className="border-t border-border px-6 py-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Verification Steps
        </h4>
        <div className="space-y-2">
          {result.checks.map((check, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/30 px-4 py-2.5">
              {check.passed ? (
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              )}
              <div>
                <p className="text-xs font-medium text-foreground">{check.name}</p>
                <p className="text-xs text-muted-foreground">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
