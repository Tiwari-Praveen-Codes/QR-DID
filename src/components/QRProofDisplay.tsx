import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRProofDisplayProps {
  proofPayload: string;
}

export default function QRProofDisplay({ proofPayload }: QRProofDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proofPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-primary/20 bg-gradient-card p-6 shadow-card"
    >
      <div className="mb-4 flex items-center gap-2">
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Proof QR Code</h3>
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        Scan this QR code on the Verifier to submit your proof without sharing personal data.
      </p>

      <div className="flex justify-center rounded-xl bg-white p-4">
        <QRCodeSVG
          value={proofPayload}
          size={200}
          level="M"
          bgColor="#ffffff"
          fgColor="#0a0f1e"
          includeMargin={false}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="mt-4 w-full border-border text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="mr-2 h-3.5 w-3.5 text-success" />
            Copied to clipboard
          </>
        ) : (
          <>
            <Copy className="mr-2 h-3.5 w-3.5" />
            Copy proof payload
          </>
        )}
      </Button>
    </motion.div>
  );
}
