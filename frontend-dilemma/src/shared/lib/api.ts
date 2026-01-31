import type { DilemmaType, Choice, DilemmaStats } from "../types";
import { getClientUuid, generateNewClientUuid } from "./clientUuid";

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
    // Получаем язык из localStorage
    const currentLanguage = localStorage.getItem("language") || "he";
    
    // Объединяем заголовки правильно: сначала Content-Type, потом из init
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Language": currentLanguage,
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

type BackendDilemmaOption = {
  id: string;
  title: string;
  description: string;
};

type BackendDilemma = {
  name: string;
  title: string;
  description: string;
  options: BackendDilemmaOption[];
  hasParticipated: boolean;
};

// Response from GET /statistics/paths/:name (pathCounts + optionCounts)
type BackendPathStatsResponse = {
  pathCounts: Record<string, number>;
  totalCompleted: number;
  optionCounts?: Record<string, number>;
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
  initialChoice: string;
  finalChoice: string;
  changedMind: boolean;
  path: string;
  timeToDecide: number;
};

export type BackendMyDecisionItem = {
  dilemmaName: string;
  initialChoice: string;
  finalChoice: string | null;
  changedMind?: boolean;
  path?: string;
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
  if (!dilemmaName || typeof dilemmaName !== "string") {
    throw new Error("dilemmaName must be a non-empty string");
  }

  const choiceValue = typeof choice === "string" ? choice.toUpperCase() : choice;
  if (!/^[A-J]$/.test(choiceValue)) {
    throw new Error("choice must be A–J");
  }

  let userUuid = getClientUuid();

  try {
    return await request<BackendFeedbackResponse>("/decisions/initial", {
      method: "POST",
      headers: {
        [USER_UUID_HEADER]: userUuid,
      },
      body: JSON.stringify({
        dilemmaName: String(dilemmaName),
        choice: choiceValue as "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J",
      }),
    });
  } catch (err) {
    const apiError = err as ApiError;
    if (apiError.type === "http" && apiError.status === 409) {
      userUuid = generateNewClientUuid();
      return request<BackendFeedbackResponse>("/decisions/initial", {
        method: "POST",
        headers: {
          [USER_UUID_HEADER]: userUuid,
        },
        body: JSON.stringify({
          dilemmaName: String(dilemmaName),
          choice: choiceValue as "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J",
        }),
      });
    }
    throw err;
  }
}

export async function submitFinalChoice(
  dilemmaName: DilemmaType,
  choice: Choice
): Promise<BackendDecisionResponse> {
  if (!dilemmaName || typeof dilemmaName !== "string") {
    throw new Error("dilemmaName must be a non-empty string");
  }

  const choiceValue = typeof choice === "string" ? choice.toUpperCase() : choice;
  if (!/^[A-J]$/.test(choiceValue)) {
    throw new Error("choice must be A–J");
  }

  let userUuid = getClientUuid();

  try {
    return await request<BackendDecisionResponse>("/decisions/final", {
      method: "POST",
      headers: {
        [USER_UUID_HEADER]: userUuid,
      },
      body: JSON.stringify({
        dilemmaName: String(dilemmaName),
        choice: choiceValue,
      }),
    });
  } catch (err) {
    // Если пользователь уже проголосовал (409 Conflict), генерируем новый UUID и повторяем запрос
    // Примечание: для final choice это может не сработать, если новый UUID не имеет initial choice,
    // но в этом случае бэкенд вернет 400, и ошибка будет проброшена дальше
    const apiError = err as ApiError;
    if (apiError.type === "http" && apiError.status === 409) {
      userUuid = generateNewClientUuid();
      return request<BackendDecisionResponse>("/decisions/final", {
        method: "POST",
        headers: {
          [USER_UUID_HEADER]: userUuid,
        },
        body: JSON.stringify({
          dilemmaName: String(dilemmaName),
          choice: choiceValue as "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J",
        }),
      });
    }
    throw err;
  }
}

/** Из pathCounts (AA, AB, …) получаем буквы опций и считаем долю по финальному выбору */
function optionCountsAndPercentsFromPathCounts(
  pathCounts: Record<string, number>,
  total: number
): { optionCounts: Record<string, number>; optionPercents: Record<string, number> } {
  const letters = new Set<string>();
  for (const key of Object.keys(pathCounts)) {
    if (key.length === 2) {
      letters.add(key[0]);
      letters.add(key[1]);
    }
  }
  const sortedLetters = Array.from(letters).sort();
  const optionCounts: Record<string, number> = {};
  const optionPercents: Record<string, number> = {};
  for (const L of sortedLetters) {
    let count = 0;
    for (const X of sortedLetters) {
      count += pathCounts[`${X}${L}`] ?? 0;
    }
    optionCounts[L] = count;
    optionPercents[L] = total > 0 ? Math.round((count / total) * 100) : (sortedLetters.length > 0 ? Math.round(100 / sortedLetters.length) : 0);
  }
  return { optionCounts, optionPercents };
}

export async function fetchDilemmaStats(
  dilemmaName: DilemmaType
): Promise<DilemmaStats> {
  const data = await request<BackendPathStatsResponse>(
    `/statistics/paths/${dilemmaName}`
  );

  const total = data.totalCompleted ?? 0;
  const pathCounts = data.pathCounts ?? {};
  const { optionCounts: derivedCounts, optionPercents } = optionCountsAndPercentsFromPathCounts(pathCounts, total);
  const optionCounts = data.optionCounts && Object.keys(data.optionCounts).length > 0 ? data.optionCounts : derivedCounts;

  const aCount = optionCounts["A"] ?? 0;
  const bCount = optionCounts["B"] ?? 0;
  const cCount = optionCounts["C"] ?? 0;
  const aPercent = optionPercents["A"] ?? 50;
  const bPercent = optionPercents["B"] ?? 50;
  const cPercent = optionPercents["C"] ?? 33;

  return {
    dilemmaId: dilemmaName,
    total,
    pathCounts,
    optionCounts,
    optionPercents,
    aCount,
    bCount,
    aPercent,
    bPercent,
    cCount,
    cPercent,
  };
}

export async function getAiReport(
  dilemmaId: DilemmaType,
  choice: Choice,
  reasonText: string | null
): Promise<string> {
  const stats = await fetchDilemmaStats(dilemmaId);
  const choiceLabels: Record<string, string> = { A: "א", B: "ב", C: "ג", D: "ד", E: "ה", F: "ו", G: "ז", H: "ח", I: "ט", J: "י" };
  const choiceLabel = choiceLabels[choice] ?? choice;
  const choicePercent = stats.optionPercents?.[choice] ?? (choice === "A" ? (stats.aPercent ?? 0) : choice === "B" ? (stats.bPercent ?? 0) : stats.cPercent ?? 33);

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
  const choiceLabels: Record<string, string> = { A: "א", B: "ב", C: "ג", D: "ד", E: "ה", F: "ו", G: "ז", H: "ח", I: "ט", J: "י" };
  const choiceLabel = choiceLabels[choice] ?? choice;
  const choicePercent = stats.optionPercents?.[choice] ?? (choice === "A" ? (stats.aPercent ?? 0) : choice === "B" ? (stats.bPercent ?? 0) : stats.cPercent ?? 33);

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

export interface DilemmaTextData {
  title: string;
  subtitle?: string;
  questionText?: string;
  description: string;
  reflectionText?: string;
  options: {
    a: string;
    b: string;
  };
}

/** POST /api/feedback/analyze — AI counter-arguments for user's choice. */
export async function fetchFeedbackAnalyze(
  dilemmaName: DilemmaType,
  choice: Choice,
  reasoning?: string,
  dilemmaText?: DilemmaTextData,
  dilemmaTextOriginal?: DilemmaTextData
): Promise<string[]> {
  const userUuid = getClientUuid();
  const choiceValue = typeof choice === "string" ? choice.toUpperCase() : choice;
  if (!/^[A-J]$/.test(choiceValue)) {
    throw new Error("choice must be A–J");
  }

  const payload: {
    dilemmaName: string;
    choice: string;
    reasoning?: string;
    dilemmaText?: DilemmaTextData;
    dilemmaTextOriginal?: DilemmaTextData;
  } = { dilemmaName: String(dilemmaName), choice: choiceValue };
  
  if (reasoning != null && reasoning.trim() !== "") {
    payload.reasoning = reasoning.trim();
  }
  
  if (dilemmaText) {
    payload.dilemmaText = dilemmaText;
  }
  
  if (dilemmaTextOriginal) {
    payload.dilemmaTextOriginal = dilemmaTextOriginal;
  }

  const res = await request<{ counterArguments: string[] }>("/feedback/analyze", {
    method: "POST",
    headers: { [USER_UUID_HEADER]: userUuid },
    body: JSON.stringify(payload),
  });

  return res.counterArguments ?? [];
}

