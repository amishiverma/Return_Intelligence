import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useInView } from '@/hooks/useInView';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  accentColor?: 'cyan' | 'purple' | 'green' | 'warning';
  delay?: number;
}

/* =========================
   STYLE MAP (STATIC)
========================= */
const accentStyles = {
  cyan: {
    iconBg: 'from-accent/20 to-accent/5',
    iconColor: 'text-accent',
    glow: 'group-hover:shadow-glow-cyan',
  },
  purple: {
    iconBg: 'from-accent-purple/20 to-accent-purple/5',
    iconColor: 'text-accent-purple',
    glow: 'group-hover:shadow-glow-purple',
  },
  green: {
    iconBg: 'from-success/20 to-success/5',
    iconColor: 'text-success',
    glow: 'group-hover:shadow-[0_0_40px_hsl(160_85%_45%/0.3)]',
  },
  warning: {
    iconBg: 'from-warning/20 to-warning/5',
    iconColor: 'text-warning',
    glow: 'group-hover:shadow-[0_0_40px_hsl(45_100%_55%/0.3)]',
  },
} as const;

type AccentKey = keyof typeof accentStyles;

export function StatCard({
  title,
  value,
  suffix = '',
  prefix = '',
  trend,
  trendLabel,
  icon: Icon,
  accentColor = 'cyan',
  delay = 0,
}: StatCardProps) {
  const [ref, isInView] = useInView<HTMLDivElement>();

  /* =========================
     DATA SAFETY
  ========================= */
  const safeValue =
    typeof value === 'number' && !Number.isNaN(value) ? value : 0;

  const safeTrend =
    typeof trend === 'number' && !Number.isNaN(trend) ? trend : undefined;

  const accentKey: AccentKey =
    accentColor in accentStyles ? accentColor : 'cyan';

  const styles = accentStyles[accentKey];

  /* =========================
     ANIMATION
  ========================= */
  const animatedValue = useAnimatedNumber(
    isInView ? safeValue : 0,
    { delay: delay + 200 }
  );

  /* =========================
     RENDER
  ========================= */
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className={cn(
        'glass-card rounded-2xl p-6 group transition-all duration-300',
        styles.glow
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
            styles.iconBg
          )}
        >
          <Icon className={cn('w-6 h-6', styles.iconColor)} />
        </div>

        {safeTrend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              safeTrend >= 0
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {safeTrend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(safeTrend)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="stat-number text-3xl font-bold text-foreground">
          {prefix}
          {animatedValue.toLocaleString()}
          {suffix}
        </div>

        <div className="text-sm text-muted-foreground">{title}</div>

        {trendLabel && (
          <div className="text-xs text-muted-foreground/70">
            {trendLabel}
          </div>
        )}
      </div>
    </motion.div>
  );
}
