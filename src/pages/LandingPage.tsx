import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Cpu, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import QuantumParticles from '@/components/QuantumParticles';

const features = [
  {
    icon: Lock,
    title: 'SPHINCS+ Signatures',
    description: 'NIST-standardised hash-based signatures that resist Shor\'s Algorithm. No curves, no factoring assumptions.',
  },
  {
    icon: Eye,
    title: 'Selective Disclosure',
    description: 'Prove specific claims ("I am over 18") without revealing name, DOB, or document number via Merkle proofs.',
  },
  {
    icon: Shield,
    title: 'Self-Sovereign',
    description: 'Keys never leave your device. No centralised server. You control your identity.',
  },
  {
    icon: Cpu,
    title: 'In-Browser Crypto',
    description: 'Real post-quantum cryptography running as WASM in your browser. No backend, no trust assumptions.',
  },
];

const stats = [
  { value: '4.7B', label: 'Digital identities at risk' },
  { value: '1.4B', label: 'Aadhaar records use RSA' },
  { value: '2026', label: 'eIDAS 2.0 deadline' },
  { value: '<2s', label: 'Proof generation time' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <QuantumParticles />
        <div className="pointer-events-none absolute inset-0 grid-quantum" />
        <div className="container relative mx-auto px-4 pb-20 pt-24 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-medium text-muted-foreground">
                Harvest now, decrypt later — the threat is active today
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              <span className="text-foreground">Quantum-Resistant</span>
              <br />
              <span className="text-gradient-quantum">Decentralized Identity</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              In 2030, someone will be able to forge your passport, your degree, and your bank identity.{' '}
              <span className="text-foreground font-medium">QR-DID is the working fix</span> — demonstrated live,
              in-browser, with real post-quantum cryptography.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="bg-gradient-quantum font-semibold text-primary-foreground shadow-glow hover:opacity-90 px-8">
                <Link to="/wallet">
                  Open Wallet
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary">
                <Link to="/dashboard">View Threat Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/20">
        <div className="container mx-auto grid grid-cols-2 gap-px md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="border-r border-border px-6 py-8 text-center last:border-r-0 even:border-r-0 md:even:border-r"
            >
              <p className="text-2xl font-bold text-gradient-quantum md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">How QR-DID Works</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Post-quantum identity protection built on NIST standards
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="group rounded-xl border border-border bg-gradient-card p-6 shadow-card transition-all hover:border-primary/30 hover:shadow-quantum"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo flow */}
      <section className="border-t border-border bg-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold text-foreground">Demo Flow</h2>
            <p className="mt-3 text-sm text-muted-foreground">Three steps to quantum-safe identity verification</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Select Claims', desc: 'Toggle which credential fields to disclose. Redacted fields are never shared.' },
              { step: '02', title: 'Generate Proof', desc: 'ZK proof generated in-browser with SPHINCS+ signature. Under 2 seconds.' },
              { step: '03', title: 'Verify', desc: 'Verifier confirms claims cryptographically. Zero personal data received.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
                  <span className="font-mono text-lg font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            QR-DID · Quantum-Resistant Decentralized Identity · Competition Build v1.0
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            SPHINCS+ (SLH-DSA) · NIST FIPS 205 · Hash-based Post-Quantum Cryptography
          </p>
        </div>
      </footer>
    </div>
  );
}
