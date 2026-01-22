import type { DilemmaType, Choice, DilemmaStats } from "../types";
import { getClientUuid } from "./clientUuid";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export interface ApiError {
  type: "network" | "http" | "parse";
  status?: number;
  message: string;
  originalError?: unknown;
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  try {
    // Объединяем заголовки правильно: сначала Content-Type, потом из init
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, init.headers);
      }
    }

    const response = await fetch(`${API_BASE_URL}${input}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      // Попытка извлечь сообщения об ошибках валидации от NestJS
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message && Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else if (errorData.message && typeof errorData.message === "string") {
          errorMessage = errorData.message;
        }
      } catch {
        // Игнорируем ошибки парсинга JSON ошибки
      }

      const error: ApiError = {
        type: "http",
        status: response.status,
        message: errorMessage,
      };
      throw error;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err && typeof err === "object" && "type" in err) {
      throw err;
    }
    const error: ApiError = {
      type: "network",
      message: err instanceof Error ? err.message : "Network error occurred",
      originalError: err,
    };
    throw error;
  }
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

// Реальная структура ответа от /statistics/paths/:name
type BackendPathStatsResponse = {
  AA: number;
  AB: number;
  BA: number;
  BB: number;
  totalCompleted: number;
};

type BackendUser = {
  id: string;
  clientUuid: string;
  createdAt: string;
  lastActive: string;
};

type BackendFeedbackResponse = {
  decisionId: number;
  feedback: string;
};

type BackendDecisionResponse = {
  decisionId: number;
  initialChoice: "A" | "B";
  finalChoice: "A" | "B";
  changedMind: boolean;
  path: "AA" | "AB" | "BB" | "BA";
  timeToDecide: number;
};

export type BackendMyDecisionItem = {
  dilemmaName: string;
  initialChoice: "A" | "B";
  finalChoice: "A" | "B" | null;
  changedMind?: boolean;
  path?: "AA" | "AB" | "BB" | "BA";
  timeToDecide?: number;
};

const USER_UUID_HEADER = "X-User-UUID";

export async function fetchDilemmas(): Promise<BackendDilemma[]> {
  return request<BackendDilemma[]>("/dilemmas");
}

export async function fetchUsers(): Promise<BackendUser[]> {
  return request<BackendUser[]>("/users");
}

export async function fetchDilemmaDetails(
  dilemmaName: DilemmaType
): Promise<BackendDilemma> {
  return request<BackendDilemma>(`/dilemmas/${dilemmaName}`);
}

export async function fetchMyDecisions(): Promise<BackendMyDecisionItem[]> {
  const userUuid = getClientUuid();
  try {
    return await request<BackendMyDecisionItem[]>("/decisions/my", {
      method: "GET",
      headers: { [USER_UUID_HEADER]: userUuid },
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.type === "http" && err.status === 404) {
      return [];
    }
    throw e;
  }
}

export async function submitInitialChoice(
  dilemmaName: DilemmaType,
  choice: Choice
): Promise<BackendFeedbackResponse> {
  const userUuid = getClientUuid();

  if (!dilemmaName || typeof dilemmaName !== "string") {
    throw new Error("dilemmaName must be a non-empty string");
  }

  const choiceValue = choice === "a" ? "A" : "B";
  if (choiceValue !== "A" && choiceValue !== "B") {
    throw new Error("choice must be 'a' or 'b'");
  }

  return request<BackendFeedbackResponse>("/decisions/initial", {
    method: "POST",
    headers: {
      [USER_UUID_HEADER]: userUuid,
    },
    body: JSON.stringify({
      dilemmaName: String(dilemmaName),
      choice: choiceValue,
    }),
  });
}

export async function submitFinalChoice(
  dilemmaName: DilemmaType,
  choice: Choice
): Promise<BackendDecisionResponse> {
  const userUuid = getClientUuid();

  if (!dilemmaName || typeof dilemmaName !== "string") {
    throw new Error("dilemmaName must be a non-empty string");
  }

  const choiceValue = choice === "a" ? "A" : "B";
  if (choiceValue !== "A" && choiceValue !== "B") {
    throw new Error("choice must be 'a' or 'b'");
  }

  return request<BackendDecisionResponse>("/decisions/final", {
    method: "POST",
    headers: {
      [USER_UUID_HEADER]: userUuid,
    },
    body: JSON.stringify({
      dilemmaName: String(dilemmaName),
      choice: choiceValue,
    }),
  });
}

export async function fetchDilemmaStats(
  dilemmaName: DilemmaType
): Promise<DilemmaStats> {
  const data = await request<BackendPathStatsResponse>(
    `/statistics/paths/${dilemmaName}`
  );

  // Бэкенд возвращает статистику путей напрямую
  const total = data.totalCompleted || (data.AA + data.AB + data.BB + data.BA);

  // Маппим в существующую структуру фронта
  const aCount = data.AA + data.AB;
  const bCount = data.BB + data.BA;

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

