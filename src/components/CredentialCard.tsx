import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Eye, EyeOff, Shield, Lock, Sparkles } from 'lucide-react';
import type { CredentialField } from '@/lib/crypto/zkproof';

interface CredentialCardProps {
  fields: CredentialField[];
  onToggleField: (index: number) => void;
  issuerVerified?: boolean;
  generating?: boolean;
  generationProgress?: number; // 0-100
}

const fieldVariants = {
  disclosed: {
    filter: 'blur(0px)',
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
  redacted: {
    filter: 'blur(6px)',
    opacity: 0.35,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

const badgeVariants = {
  disclosed: {
    backgroundColor: 'hsl(var(--primary) / 0.15)',
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
  redacted: {
    backgroundColor: 'hsl(var(--secondary))',
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
};

export default function CredentialCard({
  fields,
  onToggleField,
  issuerVerified = true,
  generating = false,
  generationProgress = 0,
}: CredentialCardProps) {
  const disclosedCount = fields.filter(f => f.disclosed).length;
  const progressWidth = useMotionValue(generationProgress);
  const progressGlow = useTransform(progressWidth, [0, 100], ['0px', '12px']);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-card"
    >
      {/* Proof generation progress bar */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 3 }}
            exit={{ opacity: 0, height: 0 }}
            className="relative w-full overflow-hidden bg-primary/10"
          >
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-quantum"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ boxShadow: `0 0 8px hsl(var(--primary) / 0.6)` }}
            />
            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-quantum"
            animate={generating ? { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] } : {}}
            transition={generating ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
          >
            {generating ? (
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            ) : (
              <Shield className="h-5 w-5 text-primary-foreground" />
            )}
          </motion.div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Government Identity Credential</h3>
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.p
                  key="gen"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs font-medium text-primary"
                >
                  Building Merkle tree & generating proof…
                </motion.p>
              ) : (
                <motion.p
                  key="issuer"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-muted-foreground"
                >
                  Issued by National Identity Authority
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
        {issuerVerified && (
          <motion.div
            layout
            className="flex items-center gap-1.5 rounded-full bg-quantum-dark/30 px-3 py-1"
          >
            <Lock className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">SPHINCS+ Signed</span>
          </motion.div>
        )}
      </div>

      {/* Fields */}
      <div className="divide-y divide-border">
        {fields.map((field, index) => (
          <motion.div
            key={field.name}
            layout
            className="group relative flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-secondary/30"
            whileHover={{ x: 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Disclosed indicator bar */}
            <AnimatePresence>
              {field.disclosed && (
                <motion.div
                  layoutId={`indicator-${field.name}`}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                  style={{ boxShadow: '0 0 6px hsl(var(--primary) / 0.5)' }}
                />
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {field.name}
              </p>
              <motion.p
                className="mt-0.5 text-sm font-medium select-none"
                variants={fieldVariants}
                animate={field.disclosed ? 'disclosed' : 'redacted'}
              >
                {field.value}
              </motion.p>
            </div>

            <motion.button
              onClick={() => onToggleField(index)}
              variants={badgeVariants}
              animate={field.disclosed ? 'disclosed' : 'redacted'}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                field.disclosed ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {field.disclosed ? (
                  <motion.span
                    key="eye"
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Disclosed
                  </motion.span>
                ) : (
                  <motion.span
                    key="eyeoff"
                    initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    Redacted
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Footer with animated counter */}
      <div className="border-t border-border bg-secondary/20 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <motion.span
            key={disclosedCount}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <span className="font-semibold text-primary">{disclosedCount}</span> of{' '}
            {fields.length} fields disclosed
          </motion.span>
          <span className="font-mono">Merkle leaves: {fields.length}</span>
        </div>

        {/* Disclosure bar */}
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-gradient-quantum"
            animate={{ width: `${(disclosedCount / fields.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={{
              boxShadow: disclosedCount > 0 ? '0 0 8px hsl(var(--primary) / 0.4)' : 'none',
            }}
          />
        </div>
      </div>

      {/* Decorative quantum grid */}
      <div className="pointer-events-none absolute inset-0 grid-quantum opacity-30" />
    </motion.div>
  );
}
