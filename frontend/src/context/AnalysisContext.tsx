import { createContext, useContext, useState, ReactNode } from 'react';
import { RootCause } from '@/types';
import { useApp } from '@/context/AppContext';

interface AnalysisContextType {
  analysis: any | null;
  setAnalysisResult: (data: { analysis: any; rootCauses: any[] }) => void;
  resetAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<any | null>(null);

  // ✅ AppContext owns rootCauses (single source of truth)
  const { setRootCauses, setIsDataLoaded } = useApp();

  const setAnalysisResult = (data: {
    analysis: any;
    rootCauses: any[];
  }) => {
    setAnalysis(data.analysis ?? null);

    /**
     * 🔥 SAFE + STRICT BACKEND → UI ADAPTER
     */
    const adaptedRootCauses: RootCause[] = (data.rootCauses ?? [])
  .filter(
    (cause) =>
      typeof cause?.reason === 'string' &&
      cause.reason.trim().length > 0
  )
  .map((cause, idx) => ({
    id: String(idx),
    title: cause.reason, // ✅ NO fallback
    description: 'AI-detected return pattern from customer feedback',
    impact: 'high',
    confidence: 85,
    category: 'Returns',
    affectedProducts: [],
    evidenceSnippets: [],
    recommendations: [],
    detectedAt: new Date().toISOString(),
    status: cause.status ?? 'new',
  }));


    setRootCauses(adaptedRootCauses);
    setIsDataLoaded(true);
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setRootCauses([]);
    setIsDataLoaded(false);
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysis,
        setAnalysisResult,
        resetAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
}
