import { useMemo } from "react";
import { getClientUuid } from "../lib/clientUuid";

export function useClientUuid(): string {
  const uuid = useMemo(() => getClientUuid(), []);
  return uuid;
}

