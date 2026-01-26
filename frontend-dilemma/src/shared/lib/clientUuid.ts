const STORAGE_KEY = "dilemma-user-uuid";

function generateUuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getClientUuid(): string {
  const existing = localStorage.getItem(STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const uuid = generateUuid();
  localStorage.setItem(STORAGE_KEY, uuid);

  return uuid;
}

export function generateNewClientUuid(): string {
  const uuid = generateUuid();
  localStorage.setItem(STORAGE_KEY, uuid);
  return uuid;
}

