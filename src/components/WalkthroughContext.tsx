import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface WalkthroughStep {
  id: string;
  route: string;
  target: string; // data-tour attribute value
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: WalkthroughStep[] = [
  {
    id: 'hero',
    route: '/',
    target: 'hero-section',
    title: 'The Quantum Threat',
    description: 'Today\'s digital identities use RSA and ECDSA — algorithms that quantum computers will break. QR-DID replaces them with NIST-standardised post-quantum cryptography.',
    position: 'bottom',
  },
  {
    id: 'stats',
    route: '/',
    target: 'stats-section',
    title: 'Scale of the Problem',
    description: '4.7 billion digital identities rely on vulnerable cryptography. Nation-states are already harvesting encrypted data to decrypt later.',
    position: 'bottom',
  },
  {
    id: 'open-wallet',
    route: '/',
    target: 'open-wallet-btn',
    title: 'Try It Live',
    description: 'Click "Open Wallet" to generate real post-quantum keys and create a verifiable credential — all running in your browser.',
    position: 'bottom',
  },
  {
    id: 'keygen',
    route: '/wallet',
    target: 'keygen-section',
    title: 'Step 1: Generate Keys',
    description: 'Generate a SPHINCS+ (SLH-DSA) keypair — a hash-based signature scheme standardised by NIST as FIPS 205. Resistant to Shor\'s algorithm.',
    position: 'right',
  },
  {
    id: 'credential',
    route: '/wallet',
    target: 'credential-card',
    title: 'Step 2: Select Claims',
    description: 'Toggle which fields to disclose. Redacted fields are never sent — only their Merkle proof commitment. This is selective disclosure.',
    position: 'right',
  },
  {
    id: 'proof-btn',
    route: '/wallet',
    target: 'proof-generate-btn',
    title: 'Step 3: Generate Proof',
    description: 'Generates a ZK proof with a Merkle credential tree, signs it with SPHINCS+, and encodes it as a QR code. Under 2 seconds.',
    position: 'top',
  },
  {
    id: 'verifier',
    route: '/verifier',
    target: 'verify-btn',
    title: 'Step 4: Verify',
    description: 'The verifier checks the SPHINCS+ signature and Merkle proofs cryptographically. It learns the disclosed claims but receives zero personal data for redacted fields.',
    position: 'right',
  },
  {
    id: 'dashboard',
    route: '/dashboard',
    target: 'threat-table',
    title: 'Why This Matters',
    description: 'Aadhaar, eIDAS, passports — billions of identity records use RSA/ECDSA. QR-DID demonstrates a working migration path using browser-native post-quantum cryptography.',
    position: 'top',
  },
];

interface WalkthroughCtx {
  active: boolean;
  currentStep: number;
  steps: WalkthroughStep[];
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
}

const Ctx = createContext<WalkthroughCtx | null>(null);

export function useWalkthrough() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWalkthrough must be inside WalkthroughProvider');
  return ctx;
}

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const goToStep = useCallback((idx: number) => {
    const step = STEPS[idx];
    if (!step) return;
    if (location.pathname !== step.route) {
      navigate(step.route);
    }
    setCurrentStep(idx);
  }, [navigate, location.pathname]);

  const start = useCallback(() => {
    setActive(true);
    setCurrentStep(0);
    if (location.pathname !== STEPS[0].route) {
      navigate(STEPS[0].route);
    }
  }, [navigate, location.pathname]);

  const stop = useCallback(() => {
    setActive(false);
    setCurrentStep(0);
  }, []);

  const next = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      stop();
    }
  }, [currentStep, goToStep, stop]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  return (
    <Ctx.Provider value={{ active, currentStep, steps: STEPS, start, stop, next, prev }}>
      {children}
    </Ctx.Provider>
  );
}
