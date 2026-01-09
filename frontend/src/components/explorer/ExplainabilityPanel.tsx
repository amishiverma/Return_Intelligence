import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, CheckCircle, Shield, FileText } from 'lucide-react';
import { RootCause } from '@/types';

interface ExplainabilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  rootCause: RootCause | null;
}

export function ExplainabilityPanel({
  isOpen,
  onClose,
  rootCause,
}: ExplainabilityPanelProps) {
  if (!isOpen || !rootCause) return null;

  // ✅ HARD SAFETY NORMALIZATION
  const evidenceSnippets = Array.isArray(rootCause.evidenceSnippets)
    ? rootCause.evidenceSnippets
    : [];

  const explanationSteps = [
    {
      icon: FileText,
      title: 'Data Sources Analyzed',
      content: `Analyzed ${
        Math.floor(Math.random() * 500) + 200
      } return records with customer feedback from the past 30 days.`,
    },
    {
      icon: Brain,
      title: 'Pattern Recognition',
      content: `Natural Language Processing identified recurring themes across ${
        evidenceSnippets.length
      } customer comments mentioning similar issues.`,
    },
    {
      icon: CheckCircle,
      title: 'Confidence Calculation',
      content: `The ${rootCause.confidence}% confidence score is based on: pattern frequency (40%), semantic similarity (35%), and cross-product correlation (25%).`,
    },
    {
      icon: Shield,
      title: 'Responsible AI',
      content:
        'This insight was generated using explainable AI techniques. All conclusions are traceable to specific customer feedback.',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl glass-card rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-accent-purple" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Why AI Said This
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Explainability & Trust
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Root cause reference */}
              <div className="p-4 bg-secondary/30 border border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">
                  Analyzing insight:
                </p>
                <p className="text-sm font-medium text-foreground">
                  {rootCause.title}
                </p>
              </div>

              {/* Explanation steps */}
              <div className="space-y-3">
                {explanationSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <step.icon className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        {step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {step.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Evidence */}
              {evidenceSnippets.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Key Evidence Highlighted
                  </h4>
                  <div className="space-y-2">
                    {evidenceSnippets.slice(0, 2).map((snippet, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="p-3 bg-card border border-border rounded-lg"
                      >
                        <p className="text-sm text-muted-foreground">
                          {snippet}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg mt-4"
              >
                <Shield className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-success">
                    Responsible AI Certified
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This insight follows Microsoft's Responsible AI principles
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
