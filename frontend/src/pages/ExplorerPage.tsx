import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  AlertTriangle,
  Lightbulb,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Send,
} from 'lucide-react';

import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ExpectationVsReality } from '@/components/explorer/ExpectationVsReality';
import { ExplainabilityPanel } from '@/components/explorer/ExplainabilityPanel';

/* =========================
   SAFE CONFIG
========================= */

const impactConfig = {
  high: {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
  },
  medium: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
  },
  low: {
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/30',
  },
} as const;

type ImpactKey = keyof typeof impactConfig;

function normalizeImpact(value: any): ImpactKey {
  if (value === 'high' || value === 'medium' || value === 'low') {
    return value;
  }
  return 'high';
}

/* =========================
   COMPONENT
========================= */

export default function ExplorerPage() {
  const {
    rootCauses,
    selectedRootCause,
    setSelectedRootCause,
    role,
    applyFix,
    dismissRootCause,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterImpact, setFilterImpact] = useState<'all' | ImpactKey>('all');
  const [showExpectationView, setShowExpectationView] = useState(false);
  const [showExplainPanel, setShowExplainPanel] = useState(false);

  /* =========================
     SAFETY NORMALIZATION
  ========================= */

  const safeRootCauses = Array.isArray(rootCauses) ? rootCauses : [];
  const query = searchQuery.toLowerCase();

  const filteredCauses = safeRootCauses.filter((cause) => {
    const title = cause?.title?.toLowerCase?.() ?? '';
    const description = cause?.description?.toLowerCase?.() ?? '';

    const matchesSearch =
      title.includes(query) || description.includes(query);

    const impact = normalizeImpact(cause?.impact);
    const matchesImpact =
      filterImpact === 'all' || impact === filterImpact;

    return matchesSearch && matchesImpact;
  });

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      {/* Viewer banner */}
      {role === 'viewer' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-lg p-3 border border-warning/30"
        >
          <div className="flex items-center gap-2 text-warning">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">
              Viewing in read-only mode. Switch role to apply fixes.
            </span>
          </div>
        </motion.div>
      )}

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* ================= LEFT PANEL ================= */}
        <div className="w-96 flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Root Cause Explorer
            </h1>
            <p className="text-muted-foreground">
              AI-detected patterns from return data
            </p>
          </div>

          {/* Search */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search root causes..."
                className="w-full h-10 pl-10 pr-4 bg-secondary/50 border border-border rounded-lg text-sm"
              />
            </div>

            {/* Impact Filter */}
            <div className="flex gap-2">
              {['all', 'high', 'medium', 'low'].map((impact) => (
                <button
                  key={impact}
                  onClick={() => setFilterImpact(impact as any)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    filterImpact === impact
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary/50 text-muted-foreground'
                  )}
                >
                  {impact === 'all'
                    ? 'All'
                    : impact.charAt(0).toUpperCase() + impact.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Root Cause List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredCauses.map((cause, index) => {
              const impact = normalizeImpact(cause.impact);
              const styles = impactConfig[impact];
              const isSelected =
                selectedRootCause?.id === cause.id;

              return (
                <motion.button
                  key={cause.id ?? index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedRootCause(cause)}
                  className={cn(
                    'w-full p-4 rounded-xl border text-left transition-all',
                    isSelected
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-card/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={cn('w-5 h-5 mt-0.5', styles.color)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            styles.bg,
                            styles.color
                          )}
                        >
                          {impact.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {cause.confidence ?? 0}%
                        </span>
                        {cause.status === 'applied' && (
                          <CheckCircle className="w-3 h-3 text-success ml-auto" />
                        )}
                      </div>

                      <p className="text-sm font-medium truncate">
                        {cause.title ?? 'Unknown issue'}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {Array.isArray(cause.affectedProducts)
                          ? `${cause.affectedProducts.length} products`
                          : '—'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedRootCause ? (
              <motion.div
                key={selectedRootCause.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col glass-card rounded-2xl"
              >
                {/* Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex justify-between">
                    <h2 className="text-xl font-bold">
                      {selectedRootCause.title}
                    </h2>
                    <button onClick={() => setSelectedRootCause(null)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedRootCause.description}
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <p className="text-sm text-muted-foreground">
                    Detailed analysis and recommendations go here.
                  </p>
                </div>

                {/* Footer */}
                {role !== 'viewer' && (
                  <div className="p-4 border-t border-border flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        dismissRootCause(selectedRootCause.id)
                      }
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center glass-card rounded-2xl">
                <div className="text-center">
                  <Search className="w-16 h-16 mx-auto text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">
                    Select a root cause to view details
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <ExpectationVsReality
        isOpen={showExpectationView}
        onClose={() => setShowExpectationView(false)}
        data={selectedRootCause?.expectedVsReality}
      />

      <ExplainabilityPanel
        isOpen={showExplainPanel}
        onClose={() => setShowExplainPanel(false)}
        rootCause={selectedRootCause}
      />
    </div>
  );
}
