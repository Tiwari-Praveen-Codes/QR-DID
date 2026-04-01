import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalkthrough } from './WalkthroughContext';

export default function WalkthroughOverlay() {
  const { active, currentStep, steps, next, prev, stop } = useWalkthrough();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const step = steps[currentStep];

  useEffect(() => {
    if (!active || !step) return;

    const find = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect(r);

        const pos = step.position || 'bottom';
        const margin = 16;
        let x = r.left + r.width / 2;
        let y = r.bottom + margin;

        if (pos === 'top') {
          y = r.top - margin;
        } else if (pos === 'left') {
          x = r.left - margin;
          y = r.top + r.height / 2;
        } else if (pos === 'right') {
          x = r.right + margin;
          y = r.top + r.height / 2;
        }

        setTooltipPos({ x, y });
      } else {
        setRect(null);
      }
      rafRef.current = requestAnimationFrame(find);
    };

    // Delay to allow page navigation to render
    const timeout = setTimeout(() => {
      find();
    }, 300);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, step]);

  if (!active || !step) return null;

  const pos = step.position || 'bottom';

  // Clamp tooltip to viewport
  const tooltipWidth = 340;
  const tooltipHeight = 200;
  let tx = tooltipPos.x;
  let ty = tooltipPos.y;

  if (pos === 'bottom' || pos === 'top') {
    tx = Math.max(tooltipWidth / 2 + 16, Math.min(tx, window.innerWidth - tooltipWidth / 2 - 16));
    if (pos === 'top') ty = ty - tooltipHeight;
  } else if (pos === 'right') {
    tx = Math.min(tx, window.innerWidth - tooltipWidth - 16);
  } else if (pos === 'left') {
    tx = Math.max(16, tx - tooltipWidth);
  }

  if (pos === 'left' || pos === 'right') {
    ty = Math.max(16, Math.min(ty - tooltipHeight / 2, window.innerHeight - tooltipHeight - 16));
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Dim overlay with cutout */}
        <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={stop}>
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - 6}
                  y={rect.top - 6}
                  width={rect.width + 12}
                  height={rect.height + 12}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="hsl(220 20% 4% / 0.75)"
            mask="url(#tour-mask)"
          />
        </svg>

        {/* Highlight ring */}
        {rect && (
          <motion.div
            key={step.id + '-ring'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute rounded-xl border-2 border-primary shadow-glow pointer-events-none"
            style={{
              left: rect.left - 6,
              top: rect.top - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: pos === 'top' ? 10 : pos === 'bottom' ? -10 : 0, x: pos === 'left' ? 10 : pos === 'right' ? -10 : 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute pointer-events-auto"
          style={{
            left: pos === 'right' ? tx : pos === 'left' ? tx : tx - tooltipWidth / 2,
            top: ty,
            width: tooltipWidth,
          }}
        >
          <div className="rounded-xl border border-border bg-card p-5 shadow-quantum">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Compass className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                  <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                </div>
              </div>
              <button onClick={stop} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {step.description}
            </p>

            {/* Progress bar */}
            <div className="mt-4 flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Nav */}
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={prev}
                disabled={currentStep === 0}
                className="text-xs text-muted-foreground"
              >
                <ChevronLeft className="mr-1 h-3 w-3" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={next}
                className="bg-gradient-quantum text-primary-foreground text-xs shadow-glow hover:opacity-90"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < steps.length - 1 && <ChevronRight className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
