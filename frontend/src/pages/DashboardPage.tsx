import { motion } from 'framer-motion';
import {
  Package,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Filter,
} from 'lucide-react';

import { StatCard } from '@/components/dashboard/StatCard';
import { ReturnTrendChart } from '@/components/dashboard/ReturnTrendChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { TopRootCauses } from '@/components/dashboard/TopRootCauses';

import { useApp } from '@/context/AppContext';
import { useAnalysis } from '@/context/AnalysisContext';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DashboardPage() {
  const { filters, setFilters } = useApp();
  const { analysis } = useAnalysis();
  const { rootCauses } = useApp();

  /* =========================
     EMPTY STATE
  ========================= */
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-12 max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-purple/10 flex items-center justify-center">
            <Package className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            No Data Yet
          </h2>
          <p className="text-muted-foreground mb-6">
            Upload your return data to unlock AI-powered insights and root cause analysis.
          </p>
          <a
            href="/upload"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            Upload Data
          </a>
        </motion.div>
      </div>
    );
  }

  /* =========================
     REAL DATA (FROM BACKEND)
  ========================= */
  const totalReturns = analysis.total_returns ?? 0;

  const appliedFixes = Array.isArray(rootCauses)
    ? rootCauses.filter((r) => r.status === 'applied').length
    : 0;

  /* =========================
     SIMULATED DATA (EXPLICIT)
     — until sales systems exist
  ========================= */
  const SIMULATED_TOTAL_SALES = 250;

  const returnRate =
    totalReturns > 0
      ? Math.round((totalReturns / SIMULATED_TOTAL_SALES) * 100)
      : 0;

  const returnRateTrend = -2; // simulated improvement vs last month

  const returnsAvoided =
    appliedFixes > 0
      ? Math.round(appliedFixes * (totalReturns * 0.15))
      : 0;

  /* =========================
     FILTER OPTIONS
  ========================= */
  const summary = analysis.summary || {};
  const reasonOptions =
    Array.isArray(summary.dominant_reasons)
      ? summary.dominant_reasons
      : [];

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            Intelligence Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            AI-powered return insights • Last updated just now
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <Filter className="w-4 h-4 text-muted-foreground" />

          <Select
            value={filters.category}
            onValueChange={(v) => setFilters({ category: v })}
          >
            <SelectTrigger className="w-[160px] bg-secondary/50">
              <SelectValue placeholder="Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              {reasonOptions.map((reason: string) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Returns"
          value={totalReturns}
          icon={Package}
          accentColor="cyan"
          delay={0}
        />
        <StatCard
          title="Return Rate"
          value={returnRate}
          suffix="%"
          trend={returnRateTrend}
          trendLabel="Estimated vs last month"
          icon={TrendingDown}
          accentColor="green"
          delay={100}
        />
        <StatCard
          title="Fixes Applied"
          value={appliedFixes}
          icon={CheckCircle}
          accentColor="purple"
          delay={200}
        />
        <StatCard
          title="Returns Avoided"
          value={returnsAvoided}
          icon={AlertTriangle}
          trendLabel="Projected after fixes"
          accentColor="warning"
          delay={300}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReturnTrendChart />
        <CategoryChart />
      </div>

      {/* Root Causes */}
      <TopRootCauses />
    </div>
  );
}
