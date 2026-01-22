import { useState, useEffect, useCallback } from "react";
import { fetchMyDecisions, type BackendMyDecisionItem } from "@/shared/lib/api";

export function useMyDecisions() {
  const [decisions, setDecisions] = useState<BackendMyDecisionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMyDecisions();
      setDecisions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load decisions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { decisions, isLoading, error, refresh };
}
