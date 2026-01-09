import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const impactColors = {
  high: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    glow: 'hover:shadow-[0_0_20px_hsl(0_85%_60%/0.2)]',
  },
  medium: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
    glow: 'hover:shadow-[0_0_20px_hsl(45_100%_55%/0.2)]',
  },
  low: {
    bg: 'bg-info/10',
    border: 'border-info/30',
    text: 'text-info',
    glow: 'hover:shadow-[0_0_20px_hsl(200_100%_55%/0.2)]',
  },
} as const;

type ImpactKey = keyof typeof impactColors;

export function TopRootCauses() {
  const [ref, isInView] = useInView<HTMLDivElement>();
  const navigate = useNavigate();
  const { rootCauses, setSelectedRootCause } = useApp();

  // ✅ SAFETY: ensure array
  const safeRootCauses = Array.isArray(rootCauses) ? rootCauses : [];
  const topCauses = safeRootCauses.slice(0, 4);

  const handleClick = (rootCause: (typeof safeRootCauses)[0]) => {
    if (!rootCause) return;
    setSelectedRootCause(rootCause);
    navigate('/explorer');
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent-purple/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Top Root Causes
            </h3>
            <p className="text-sm text-muted-foreground">
              AI-detected patterns
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/explorer')}
          className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {topCauses.map((cause, index) => {
          if (!cause) return null;

          // ✅ SAFETY: normalize impact
          const impactKey: ImpactKey =
            cause.impact === 'high' ||
            cause.impact === 'medium' ||
            cause.impact === 'low'
              ? cause.impact
              : 'high';

          const styles = impactColors[impactKey];

          return (
            <motion.button
              key={cause.id ?? index}
              initial={{ opacity: 0, x: -20 }}
              animate={
                isInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -20 }
              }
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => handleClick(cause)}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all duration-300 group',
                styles.bg,
                styles.border,
                styles.glow
              )}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={cn('w-5 h-5 mt-0.5', styles.text)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        styles.bg,
                        styles.text
                      )}
                    >
                      {impactKey.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {typeof cause.confidence === 'number'
                        ? `${cause.confidence}% confidence`
                        : '—'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
                    {cause.title ?? 'Unknown issue'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Array.isArray(cause.affectedProducts)
                      ? `${cause.affectedProducts.length} products affected`
                      : '—'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
