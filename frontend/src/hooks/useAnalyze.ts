type ReturnRow = {
  order_id: string;
  sku: string;
  category: string;
  reason: string;
  feedback: string;
};

/* =======================
   CSV PARSER
======================= */
function parseCSV(text: string): ReturnRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  return lines.slice(1).map((line, idx) => {
    const values = line.split(',').map(v => v.trim());
    const row: any = {};

    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });

    return {
      order_id: row.order_id || `CSV-${idx}`,
      sku: row.sku || 'UNKNOWN',
      category: row.category || 'Unknown',
      reason: row.reason || '',
      feedback: row.feedback || '',
    };
  });
}

/* =======================
   NORMALIZE PAYLOAD
======================= */
function normalizePayload(input: any): { returns: ReturnRow[] } {
  if (typeof input === 'string') {
    return { returns: parseCSV(input) };
  }

  if (input?.returns && Array.isArray(input.returns)) {
    return input;
  }

  return { returns: [] };
}

/* =======================
   SAFE SUMMARY PARSER
======================= */
function parseAnalysisSummary(summary?: string) {
  if (!summary) return null;

  try {
    const cleaned = summary.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/* =======================
   MAIN HOOK
======================= */
export function useAnalyze() {
  const analyzeReturns = async (payload: any) => {
    const normalized = normalizePayload(payload);

    /* ---------- ANALYZE ---------- */
    const analyzeRes = await fetch('http://127.0.0.1:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized),
    });

    if (!analyzeRes.ok) {
      throw new Error(await analyzeRes.text());
    }

    const analyzeJson = await analyzeRes.json();
    const parsedSummary = parseAnalysisSummary(
      analyzeJson?.analysis?.analysis_summary
    );

    const analysis = {
      ...analyzeJson.analysis,
      summary: parsedSummary,
    };

    /* ---------- ROOT CAUSES ---------- */
    const rootRes = await fetch('http://127.0.0.1:8000/root_causes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // backend ignores body anyway
    });

    let backendRootCauses: any[] = [];
    if (rootRes.ok) {
      const json = await rootRes.json();
      backendRootCauses = json?.root_causes ?? [];
    }

    /* ---------- 🔥 FALLBACK TO CSV REASONS ---------- */
    const csvReasons = Array.from(
      new Set(
        normalized.returns
          .map(r => r.reason)
          .filter(Boolean)
      )
    );

    const finalRootCauses =
      backendRootCauses.length > 0
        ? backendRootCauses
        : csvReasons.map(reason => ({
            reason,
            confidence: 'medium',
            status: 'open',
          }));

    return {
      analysis,
      rootCauses: finalRootCauses,
    };
  };

  return { analyzeReturns };
}
