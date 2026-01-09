import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, FilterState, RootCause } from '@/types';

interface AppContextType {
  // core state
  role: UserRole;
  isDataLoaded: boolean;
  isProcessing: boolean;
  filters: FilterState;

  // root cause state (SINGLE SOURCE OF TRUTH)
  rootCauses: RootCause[];
  selectedRootCause: RootCause | null;

  // setters
  setRole: (role: UserRole) => void;
  setIsDataLoaded: (loaded: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setRootCauses: (causes: RootCause[]) => void;
  setSelectedRootCause: (rootCause: RootCause | null) => void;

  // actions
  resetAllData: () => void;
  applyFix: (rootCauseId: string, recommendationId: string) => void;
  dismissRootCause: (rootCauseId: string) => void;
}

const defaultFilters: FilterState = {
  category: 'all',
  sku: '',
  dateRange: { start: '', end: '' },
  region: 'all',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('manager');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);

  const [rootCauses, setRootCausesState] = useState<RootCause[]>([]);
  const [selectedRootCause, setSelectedRootCauseState] =
    useState<RootCause | null>(null);

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  /**
   * 🔒 IMPORTANT:
   * When root causes change, validate selected root cause
   */
  const setRootCauses = (causes: RootCause[]) => {
    setRootCausesState(Array.isArray(causes) ? causes : []);

    setSelectedRootCauseState((prev) => {
      if (!prev) return null;
      return causes.find((c) => c.id === prev.id) ?? null;
    });
  };

  const setSelectedRootCause = (rootCause: RootCause | null) => {
    setSelectedRootCauseState(rootCause);
  };

  const resetAllData = () => {
    setIsDataLoaded(false);
    setIsProcessing(false);
    setRootCausesState([]);
    setSelectedRootCauseState(null);
  };

  const applyFix = (rootCauseId: string, recommendationId: string) => {
    setRootCausesState((prev) =>
      prev.map((rc) =>
        rc.id === rootCauseId
          ? {
              ...rc,
              status: 'applied',
              recommendations: rc.recommendations.map((r) =>
                r.id === recommendationId
                  ? { ...r, appliedAt: new Date().toISOString() }
                  : r
              ),
            }
          : rc
      )
    );
  };

  const dismissRootCause = (rootCauseId: string) => {
    setRootCausesState((prev) =>
      prev.map((rc) =>
        rc.id === rootCauseId
          ? { ...rc, status: 'dismissed' }
          : rc
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        isDataLoaded,
        isProcessing,
        filters,
        rootCauses,
        selectedRootCause,

        setRole,
        setIsDataLoaded,
        setIsProcessing,
        setFilters,
        setRootCauses,
        setSelectedRootCause,

        resetAllData,
        applyFix,
        dismissRootCause,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
