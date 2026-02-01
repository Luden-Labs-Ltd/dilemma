import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { fetchDilemmaStats } from "@/shared/lib/api";
import { formatPercent } from "@/shared/lib/utils";
import type { DilemmaStats } from "@/shared/types";
import backgroundGradient from "@/shared/assets/background-gradient.png?format=webp";
import dilemmaOption1 from "@/shared/assets/dilemmas/dilemma-option-1.png?format=webp";
import dilemmaOption2 from "@/shared/assets/dilemmas/dilemma-option-2.png?format=webp";
import dilemmaOption3 from "@/shared/assets/dilemmas/dilemma-option-3.png?format=webp";

/** URL главной страницы приложения: из VITE_APP_URL или текущий origin по умолчанию */
function getAppUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_URL_SHARE;
  return fromEnv ?? "https://dilemma-iota.vercel.app/";
}

const DILEMMA_IDS = ["commander", "doctor", "teacher"] as const;
const POLL_INTERVAL_MS = 30_000;
const DILEMMA_IMAGES: Record<(typeof DILEMMA_IDS)[number], string> = {
  commander: dilemmaOption3,
  doctor: dilemmaOption2,
  teacher: dilemmaOption1,
};

const emptyStatsList = DILEMMA_IDS.map((id) => ({
  dilemmaId: id,
  total: 0,
  pathCounts: {} as Record<string, number>,
  optionCounts: {} as Record<string, number>,
  optionPercents: {} as Record<string, number>,
}));

export function SharePage() {
  const { t } = useTranslation();
  const [statsList, setStatsList] = useState<(DilemmaStats | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function applyResult(data: DilemmaStats[]) {
      if (!cancelled) setStatsList(data);
    }
    function applyError() {
      if (!cancelled) {
        setError(t("stats.error"));
        setStatsList(emptyStatsList);
      }
    }

    async function refreshStats() {
      try {
        const data = await Promise.all(
          DILEMMA_IDS.map((id) => fetchDilemmaStats(id))
        );
        applyResult(data);
        if (!cancelled) setError(null);
      } catch {
        applyError();
      }
    }

    void refreshStats().finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    const intervalId = setInterval(refreshStats, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [t]);

  const appUrl = getAppUrl();

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-12"
        style={{ backgroundImage: `url(${backgroundGradient})` }}
      >
        <p className="text-[#E6F8F9]">{t("stats.loading")}</p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundGradient})` }}
    >
      <div className="flex-1 px-4 py-6">
        <h1 className="font-['Heebo'] mb-6 text-center text-2xl font-black text-[#E6F8F9] md:text-3xl">
          {t("share.title")}
        </h1>

        {error && (
          <p className="mb-4 text-center text-sm text-amber-300">{error}</p>
        )}

        <div className="flex flex-col flex-1 items-center justify-center px-4 pb-8 pt-4">
          <p className="font-['Heebo'] mb-3 text-center text-sm font-medium text-[#E6F8F9] md:text-base">
            {t("share.scanToOpen")}
          </p>
          <div className="rounded-2xl bg-white p-4 shadow-lg">
            <QRCode
              value={appUrl}
              size={220}
              bgColor="#FFFFFF"
              fgColor="#0f172a"
              level="M"
              title={appUrl}
            />
          </div>
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-['Heebo'] mt-3 text-sm text-[#9FE4FD] underline underline-offset-2 hover:text-[#B7ECF7]"
          >
            {appUrl}
          </a>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {DILEMMA_IDS.map((id, index) => {
            const stats = statsList[index] ?? null;
            const titleKey = `dilemmas.${id}.title`;
            const title = t(titleKey);
            const imageSrc = DILEMMA_IMAGES[id];
            return (
              <div
                key={id}
                className="relative overflow-hidden rounded-2xl border-2 border-[#9FE4FD]/50 bg-black/30 shadow-lg backdrop-blur-sm"
              >
                <div className="relative h-32 w-full shrink-0 sm:h-40">
                  <img
                    src={imageSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.6) 80%, rgba(0, 0, 0, 0.9) 100%)",
                    }}
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-['Heebo'] mb-3 text-center text-sm font-bold text-[#E6F8F9] md:text-base">
                    {title}
                  </h2>
                  <div className="flex flex-col gap-2 text-center">
                    <span className="font-['Heebo'] text-lg font-black text-[#B7ECF7]">
                      {stats?.total ?? 0} {t("share.participants")}
                    </span>
                    {stats && (
                      <div className="flex flex-wrap justify-center gap-2 text-sm text-[#E6F8F9]">
                        {(["A", "B", "C"] as const).map((opt) => {
                          const pct = stats.optionPercents?.[opt];
                          if (pct == null) return null;
                          return (
                            <span key={opt}>
                              {opt}: {formatPercent(pct)}%
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
}
