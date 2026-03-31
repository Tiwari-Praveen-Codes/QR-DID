import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Clock, TrendingUp, Lock, Unlock } from 'lucide-react';
import Navigation from '@/components/Navigation';

const threats = [
  {
    system: 'Aadhaar (India)',
    records: '1.4 billion',
    crypto: 'RSA-2048',
    status: 'vulnerable' as const,
    riskYear: '2030–2035',
    description: 'Biometric identity records signed with RSA. All signatures retroactively forgeable once CRQC is available.',
  },
  {
    system: 'EU eIDAS / EUDI Wallet',
    records: '450 million (projected)',
    crypto: 'ECDSA (P-256)',
    status: 'vulnerable' as const,
    riskYear: '2030–2035',
    description: 'Mandated by 2026 for all EU citizens. Architecture Reference Framework calls for PQC migration.',
  },
  {
    system: 'US Passports',
    records: '160 million active',
    crypto: 'RSA-2048 / ECDSA',
    status: 'vulnerable' as const,
    riskYear: '2030–2035',
    description: 'e-Passport chips use RSA for digital signatures. Captured data can be forged retroactively.',
  },
  {
    system: 'Bank KYC (Global)',
    records: '4.7 billion accounts',
    crypto: 'RSA / ECDSA (TLS + signing)',
    status: 'vulnerable' as const,
    riskYear: '2030–2035',
    description: 'KYC identity verification documents transmitted over TLS with classical signatures.',
  },
];

const timeline = [
  { year: '2019', event: 'Google achieves quantum supremacy (Sycamore, 53 qubits)', type: 'milestone' },
  { year: '2022', event: 'NIST selects SPHINCS+ as PQC standard', type: 'standard' },
  { year: '2023', event: 'IBM Condor: 1,121 qubits', type: 'milestone' },
  { year: '2024', event: 'NIST publishes FIPS 205 (SLH-DSA / SPHINCS+)', type: 'standard' },
  { year: '2024', event: 'NSA: "harvest now, decrypt later" classified as active threat', type: 'threat' },
  { year: '2026', event: 'EU eIDAS 2.0 mandates quantum-resistant identity', type: 'standard' },
  { year: '2030', event: 'Projected CRQC capability (1,000+ logical qubits)', type: 'threat' },
  { year: '2035', event: 'All RSA-2048 / ECDSA credentials retroactively broken', type: 'threat' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pb-16 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Quantum Threat Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-world credential systems vulnerable to quantum attacks
          </p>
        </motion.div>

        {/* Alert banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-xl border border-warning/30 bg-warning/5 px-6 py-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <h3 className="text-sm font-semibold text-warning">Harvest Now, Decrypt Later</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                State-level adversaries are archiving encrypted identity data today. Once a cryptographically relevant
                quantum computer (CRQC) is available, every credential signed with RSA or ECDSA can be retroactively forged.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Unlock, value: '4.7B', label: 'Identities at risk', color: 'text-destructive' },
            { icon: Clock, value: '2030', label: 'Projected CRQC year', color: 'text-warning' },
            { icon: Shield, value: 'SPHINCS+', label: 'NIST PQC standard', color: 'text-primary' },
            { icon: TrendingUp, value: '1,121', label: 'Max qubits (2023)', color: 'text-cyber-purple' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-xl border border-border bg-gradient-card p-5 shadow-card"
            >
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <p className={`mt-3 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Vulnerable systems */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-foreground">Vulnerable Credential Systems</h2>
          <div className="mt-4 space-y-4">
            {threats.map((threat, i) => (
              <motion.div
                key={threat.system}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="rounded-xl border border-border bg-gradient-card p-5 shadow-card"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-foreground">{threat.system}</h3>
                      <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                        VULNERABLE
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{threat.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-6 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Records</p>
                      <p className="text-sm font-semibold text-foreground">{threat.records}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Crypto</p>
                      <p className="text-sm font-mono font-medium text-destructive">{threat.crypto}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Risk window</p>
                      <p className="text-sm font-semibold text-warning">{threat.riskYear}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-foreground">Quantum Computing Timeline</h2>
          <div className="mt-6 space-y-0">
            {timeline.map((item, i) => {
              const colorMap = {
                milestone: 'border-cyber-purple bg-cyber-purple',
                standard: 'border-primary bg-primary',
                threat: 'border-destructive bg-destructive',
              };
              const textColor = {
                milestone: 'text-cyber-purple',
                standard: 'text-primary',
                threat: 'text-destructive',
              };

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.08 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${colorMap[item.type]}`} />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-6">
                    <span className={`font-mono text-xs font-bold ${textColor[item.type]}`}>{item.year}</span>
                    <p className="mt-0.5 text-sm text-foreground">{item.event}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* QR-DID solution box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-12 rounded-2xl border border-primary/30 bg-primary/5 p-8 shadow-quantum"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-quantum">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">QR-DID: The Post-Quantum Solution</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                QR-DID replaces the cryptographic foundation — not patches it. Using SPHINCS+ (SLH-DSA, NIST FIPS 205),
                a hash-based signature scheme that relies only on the security of hash functions (not integer factoring
                or discrete logarithms), QR-DID credentials remain secure even after quantum computers exist.
                Combined with selective disclosure via Merkle proofs, users can verify claims without exposing any
                underlying personal data.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['SPHINCS+ (FIPS 205)', 'Merkle Proofs', 'Zero-Knowledge', 'Self-Sovereign', 'Browser-Native'].map(tag => (
                  <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
