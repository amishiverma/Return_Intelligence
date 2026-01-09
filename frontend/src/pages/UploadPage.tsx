import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Database,
  CheckCircle,
  Brain,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useApp } from '@/context/AppContext';
import { useAnalysis } from '@/context/AnalysisContext';
import { useAnalyze } from '@/hooks/useAnalyze';

type UploadMethod = 'csv' | 'paste' | 'demo';
type UploadState = 'idle' | 'processing' | 'complete';

export default function UploadPage() {
  const navigate = useNavigate();

  const { setIsProcessing } = useApp();
  const { setAnalysisResult } = useAnalysis();
  const { analyzeReturns } = useAnalyze();

  const [method, setMethod] = useState<UploadMethod | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [pasteText, setPasteText] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processingSteps = [
    'Parsing return data...',
    'Extracting customer feedback...',
    'Running NLP analysis...',
    'Identifying patterns...',
    'Generating root causes...',
    'Computing confidence scores...',
    'Finalizing insights...',
  ];

  /* =========================
     CORE ANALYSIS PIPELINE
  ========================= */
  const runBackendAnalysis = async (payload: any) => {
    setIsProcessing(true);

    const response = await analyzeReturns(payload);

    /**
     * ✅ SINGLE SOURCE OF TRUTH
     * AnalysisContext adapts backend → UI-safe RootCause[]
     */
    setAnalysisResult({
      analysis: response.analysis,
      rootCauses: response.rootCauses,
    });

    setIsProcessing(false);
  };

  /* =========================
     UI SIMULATION (NON-BLOCKING)
  ========================= */
  const simulateProcessing = useCallback(
    async (payload: any) => {
      setUploadState('processing');
      setIsProcessing(true);
      setProgress(0);
      setCurrentStep(0);

      const duration = 4000;
      const interval = duration / 100;
      const stepInterval = duration / processingSteps.length;

      let progressValue = 0;
      const progressTimer = setInterval(() => {
        progressValue += 1;
        setProgress(progressValue);
        if (progressValue >= 100) clearInterval(progressTimer);
      }, interval);

      let step = 0;
      const stepTimer = setInterval(() => {
        step += 1;
        setCurrentStep(step);
        if (step >= processingSteps.length) clearInterval(stepTimer);
      }, stepInterval);

      // 🔥 Backend call (async, non-blocking)
      runBackendAnalysis(payload).catch((err) => {
        console.error('Backend analysis failed:', err);
      });

      // 🔥 UI must finish regardless of backend speed
      setTimeout(() => {
        setUploadState('complete');
        setIsProcessing(false);
      }, duration);
    },
    [setIsProcessing]
  );

  /* =========================
     HANDLERS
  ========================= */
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      if (!e.dataTransfer.files.length) return;

      const file = e.dataTransfer.files[0];
      const text = await file.text();
      simulateProcessing(text);
    },
    [simulateProcessing]
  );

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const text = await file.text();
    simulateProcessing(text);
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    simulateProcessing(pasteText);
  };

  const handleDemoMode = () => {
    setMethod('demo');
    simulateProcessing({ demo: true });
  };

  /* =========================
     PROCESSING / COMPLETE UI
  ========================= */
  if (uploadState === 'processing' || uploadState === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <motion.div className="glass-card rounded-3xl p-12 max-w-lg w-full text-center">
          {uploadState === 'processing' ? (
            <>
              <Brain className="w-12 h-12 mx-auto mb-6 text-accent animate-pulse" />
              <h2 className="text-xl font-bold mb-4">
                AI Analyzing Your Data
              </h2>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-accent-purple"
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                {processingSteps[currentStep] || 'Initializing...'}
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="w-12 h-12 mx-auto mb-6 text-success" />
              <h2 className="text-xl font-bold mb-6">
                Analysis Complete
              </h2>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-accent to-accent-purple"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View Insights
              </Button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  /* =========================
     UPLOAD UI
  ========================= */
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Data Ingestion
        </h1>
        <p className="text-muted-foreground text-lg">
          Upload your return data and let AI discover root causes
        </p>
      </motion.div>

      {/* Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { id: 'csv', icon: Upload, title: 'Upload CSV', desc: 'Import returns data file' },
          { id: 'paste', icon: FileText, title: 'Paste Text', desc: 'Customer feedback or logs' },
          { id: 'demo', icon: Database, title: 'Demo Mode', desc: 'Try with sample data' },
        ].map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() =>
              item.id === 'demo'
                ? handleDemoMode()
                : setMethod(item.id as UploadMethod)
            }
            className={cn(
              'glass-card-hover rounded-2xl p-8 text-center',
              method === item.id && 'neon-border-cyan'
            )}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent-purple/10 flex items-center justify-center">
              <item.icon className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {item.desc}
            </p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {method === 'csv' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-2xl p-16 text-center',
                dragOver
                  ? 'border-accent bg-accent/5'
                  : 'border-border'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <Button onClick={handleFileSelect} variant="outline">
                Browse Files
              </Button>
            </div>
          </motion.div>
        )}

        {method === 'paste' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card rounded-2xl p-6">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full h-48 bg-secondary/50 border rounded-xl p-4"
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handlePasteSubmit}>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze with AI
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
