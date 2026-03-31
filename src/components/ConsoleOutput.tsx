import { motion } from 'framer-motion';

interface ConsoleOutputProps {
  lines: { type: 'info' | 'success' | 'warn' | 'data'; text: string }[];
  title?: string;
}

export default function ConsoleOutput({ lines, title = 'Crypto Console' }: ConsoleOutputProps) {
  const colorMap = {
    info: 'text-muted-foreground',
    success: 'text-success',
    warn: 'text-warning',
    data: 'text-primary',
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{title}</span>
      </div>
      <div className="max-h-80 overflow-y-auto p-4">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="py-0.5"
          >
            <code className={`font-mono text-xs leading-relaxed ${colorMap[line.type]} break-all`}>
              {line.type === 'data' ? '→ ' : line.type === 'success' ? '✓ ' : line.type === 'warn' ? '⚠ ' : '  '}
              {line.text}
            </code>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
