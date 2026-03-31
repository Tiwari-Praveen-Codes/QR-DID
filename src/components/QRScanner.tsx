import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, QrCode, ClipboardPaste, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const [mode, setMode] = useState<'idle' | 'camera' | 'paste'>('idle');
  const [pasteValue, setPasteValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>('qr-reader-' + Math.random().toString(36).slice(2));

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startCamera = async () => {
    setMode('camera');
    setError(null);

    // Wait for DOM element to mount
    await new Promise(r => setTimeout(r, 200));

    try {
      const scanner = new Html5Qrcode(containerRef.current);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (decodedText) => {
          scanner.stop().catch(() => {});
          setMode('idle');
          onScan(decodedText);
        },
        () => {} // ignore scan failures (no QR found in frame)
      );
    } catch (err) {
      setError('Camera access denied or unavailable. Try pasting the proof instead.');
      setMode('idle');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setMode('idle');
  };

  const handlePaste = () => {
    if (pasteValue.trim()) {
      onScan(pasteValue.trim());
      setPasteValue('');
      setMode('idle');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-gradient-card p-6 shadow-card"
    >
      <div className="mb-4 flex items-center gap-2">
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Scan Proof QR Code</h3>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {mode === 'idle' && (
        <div className="flex gap-3">
          <Button
            onClick={startCamera}
            variant="outline"
            className="flex-1 border-primary/20 text-foreground hover:bg-primary/10"
          >
            <Camera className="mr-2 h-4 w-4" />
            Scan QR
          </Button>
          <Button
            onClick={() => setMode('paste')}
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-secondary"
          >
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Paste Proof
          </Button>
        </div>
      )}

      {mode === 'camera' && (
        <div className="space-y-3">
          <div
            id={containerRef.current}
            className="mx-auto overflow-hidden rounded-lg"
            style={{ maxWidth: 300 }}
          />
          <Button
            onClick={stopCamera}
            variant="outline"
            size="sm"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <X className="mr-2 h-3.5 w-3.5" />
            Cancel
          </Button>
        </div>
      )}

      {mode === 'paste' && (
        <div className="space-y-3">
          <Textarea
            value={pasteValue}
            onChange={e => setPasteValue(e.target.value)}
            placeholder="Paste the proof payload here..."
            className="min-h-[100px] border-border bg-secondary font-mono text-xs"
          />
          <div className="flex gap-3">
            <Button
              onClick={handlePaste}
              disabled={!pasteValue.trim()}
              className="flex-1 bg-gradient-quantum text-primary-foreground shadow-glow hover:opacity-90"
            >
              Submit Proof
            </Button>
            <Button
              onClick={() => { setMode('idle'); setPasteValue(''); }}
              variant="outline"
              className="border-border text-muted-foreground"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
