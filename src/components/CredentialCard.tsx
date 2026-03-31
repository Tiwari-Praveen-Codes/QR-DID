import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, Lock } from 'lucide-react';
import type { CredentialField } from '@/lib/crypto/zkproof';

interface CredentialCardProps {
  fields: CredentialField[];
  onToggleField: (index: number) => void;
  issuerVerified?: boolean;
}

export default function CredentialCard({ fields, onToggleField, issuerVerified = true }: CredentialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-quantum">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Government Identity Credential</h3>
            <p className="text-xs text-muted-foreground">Issued by National Identity Authority</p>
          </div>
        </div>
        {issuerVerified && (
          <div className="flex items-center gap-1.5 rounded-full bg-quantum-dark/30 px-3 py-1">
            <Lock className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">SPHINCS+ Signed</span>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="divide-y divide-border">
        {fields.map((field, index) => (
          <div
            key={field.name}
            className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-secondary/30"
          >
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {field.name}
              </p>
              <p className={`mt-0.5 text-sm font-medium ${
                field.disclosed ? 'text-foreground' : 'text-muted-foreground/40 blur-sm select-none'
              }`}>
                {field.disclosed ? field.value : field.value}
              </p>
            </div>
            <button
              onClick={() => onToggleField(index)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                field.disclosed
                  ? 'bg-primary/10 text-primary'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {field.disclosed ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Disclosed
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Redacted
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-secondary/20 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {fields.filter(f => f.disclosed).length} of {fields.length} fields disclosed
          </span>
          <span className="font-mono">
            Merkle leaves: {fields.length}
          </span>
        </div>
      </div>

      {/* Decorative quantum grid */}
      <div className="pointer-events-none absolute inset-0 grid-quantum opacity-30" />
    </motion.div>
  );
}
