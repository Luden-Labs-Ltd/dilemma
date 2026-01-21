import type { DilemmaType, Choice, DilemmaStats } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${input}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    // Можно расширить обработку ошибок под дизайн фронта
    throw new Error(`API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

type BackendDilemma = {
  name: string;
  title: string;
  description: string;
  option_a_title: string;
  option_a_description: string;
  option_b_title: string;
  option_b_description: string;
};

type BackendStatsPath = {
  name: "AA" | "AB" | "BB" | "BA";
  count: number;
  percentage: number;
  description: string;
};

type BackendStatsResponse = {
  dilemma: BackendDilemma;
  total_participants: number;
  stats: {
    AA: number;
    AB: number;
    BB: number;
    BA: number;
  };
  paths: BackendStatsPath[];
  change_rate: number;
  avg_time_to_decide: number;
};

type BackendDecisionResponse = {
  // структура может меняться, поэтому тип гибкий
  status: string;
};

const USER_UUID_HEADER = "X-User-UUID";

function getUserUuid(): string {
  const STORAGE_KEY = "dilemma-user-uuid";
  let uuid = localStorage.getItem(STORAGE_KEY);

  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, uuid);
  }

  return uuid;
}

export async function fetchDilemmas(): Promise<BackendDilemma[]> {
  return request<BackendDilemma[]>("/dilemmas");
}

export async function fetchDilemmaDetails(
  dilemmaName: DilemmaType
): Promise<BackendDilemma> {
  return request<BackendDilemma>(`/dilemmas/${dilemmaName}`);
}

export async function submitInitialChoice(
  dilemmaName: DilemmaType,
  choice: Choice
): Promise<BackendDecisionResponse> {
  const userUuid = getUserUuid();

  return request<BackendDecisionResponse>("/decisions/initial", {
    method: "POST",
    headers: {
      [USER_UUID_HEADER]: userUuid,
    },
    body: JSON.stringify({
      dilemma_name: dilemmaName,
      choice: choice === "a" ? "A" : "B",
    }),
  });
}

export async function submitFinalChoice(
  dilemmaName: DilemmaType,
  choice: Choice
): Promise<BackendDecisionResponse> {
  const userUuid = getUserUuid();

  return request<BackendDecisionResponse>("/decisions/final", {
    method: "POST",
    headers: {
      [USER_UUID_HEADER]: userUuid,
    },
    body: JSON.stringify({
      dilemma_name: dilemmaName,
      choice: choice === "a" ? "A" : "B",
    }),
  });
}

export async function fetchDilemmaStats(
  dilemmaName: DilemmaType
): Promise<DilemmaStats> {
  const data = await request<BackendStatsResponse>(
    `/statistics/dilemma/${dilemmaName}`
  );

  const total =
    data.stats.AA + data.stats.AB + data.stats.BB + data.stats.BA;

  // Маппим в существующую структуру фронта
  const aCount = data.stats.AA + data.stats.AB;
  const bCount = data.stats.BB + data.stats.BA;

  const aPercent = total > 0 ? Math.round((aCount / total) * 100) : 50;
  const bPercent = total > 0 ? Math.round((bCount / total) * 100) : 50;

  return {
    dilemmaId: dilemmaName,
    total,
    aCount,
    bCount,
    aPercent,
    bPercent,
  };
}

export async function getAiReport(
  dilemmaId: DilemmaType,
  choice: Choice,
  reasonText: string | null
): Promise<string> {
  // Пока backend не отдает AI-отчет, оставим локальный текст, но уже с реальной статистикой
  const stats = await fetchDilemmaStats(dilemmaId);
  const choiceLabel = choice === "a" ? "א" : "ב";
  const choicePercent =
    choice === "a" ? stats.aPercent : stats.bPercent;

  if (reasonText) {
    return `על בסיס הבחירה שלך (אפשרות ${choiceLabel}) והסבר שכתבת, נראה שאתה מתחשב בהיבטים מורכבים של הדילמה. כרגע ${choicePercent}% מהמשתתפים בחרו באפשרות זו.`;
  }

  return `בחרת באפשרות ${choiceLabel}. ${choicePercent}% מהמשתתפים בחרו כמוך. זוהי בחירה שמשקפת עמדה ברורה בנושא מורכב זה.`;
}

export async function getInsightData(
  dilemmaId: DilemmaType,
  choice: Choice,
  reasonText: string | null
) {
  const stats = await fetchDilemmaStats(dilemmaId);
  const choiceLabel = choice === "a" ? "א" : "ב";
  const choicePercent =
    choice === "a" ? stats.aPercent : stats.bPercent;

  let interpretation: string;

  if (choicePercent > 60) {
    interpretation = `הבחירה שלך (אפשרות ${choiceLabel}) היא הבחירה הנפוצה ביותר. ${choicePercent}% מהמשתתפים בחרו כמוך. זה מראה שרבים חושבים באופן דומה.`;
  } else if (choicePercent < 40) {
    interpretation = `הבחירה שלך (אפשרות ${choiceLabel}) היא פחות נפוצה - רק ${choicePercent}% בחרו כמוך. זה מראה על חשיבה עצמאית ונקודת מבט ייחודית.`;
  } else {
    interpretation = `הבחירה שלך (אפשרות ${choiceLabel}) משקפת את הפילוג הקרוב בקהילה. ${choicePercent}% בחרו כמוך, מה שמראה שזו דילמה אמיתית עם שני צדדים תקפים.`;
  }

  return {
    choice,
    choiceLabel,
    reasonText,
    stats,
    interpretation,
  };
}

