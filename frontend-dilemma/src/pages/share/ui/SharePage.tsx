import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/** QR size by viewport width for gradual responsive scaling. */
function getQrSize(): number {
  if (typeof window === "undefined") return 220;
  const w = window.innerWidth;
  if (w < 400) return 140;
  if (w < 640) return 180;
  if (w < 768) return 200;
  if (w < 1024) return 240;
  if (w < 1280) return 260;
  if (w < 1920) return 300;
  return 340;
}
import QRCode from "react-qr-code";
import { fetchDilemmaStats } from "@/shared/lib/api";
import { formatPercent } from "@/shared/lib/utils";
import type { DilemmaStats } from "@/shared/types";
import backgroundGradient from "@/shared/assets/background-gradient.png?format=webp";
import logoImg from "@/shared/assets/logo.png?format=webp";
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
  const [qrSize, setQrSize] = useState(() => getQrSize());

  useEffect(() => {
    const onResize = () => setQrSize(getQrSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
      <div className="flex-1 px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-20 xl:py-20 2xl:px-12 2xl:py-14">
        <div className="mb-3 flex justify-center sm:mb-4 md:mb-5 lg:mb-6 xl:mb-8 2xl:mb-10">
          <img
            src={logoImg}
            alt=""
            aria-hidden="true"
            className="h-auto w-[min(160px,42vw)] max-w-[200px] object-contain sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] xl:max-w-[380px] 2xl:max-w-[420px]"
          />
        </div>

        {error && (
          <p className="mb-3 text-center text-sm text-amber-300 sm:mb-4 md:text-base">
            {error}
          </p>
        )}

        <div className="flex flex-1 flex-col items-center justify-center px-2 pb-4 pt-2 sm:px-4 sm:pb-6 sm:pt-4 md:pb-8 md:pt-5 lg:pb-10 lg:pt-6">
          <p className="font-['Heebo'] mb-2 text-center text-sm font-medium text-[#E6F8F9] sm:mb-3 sm:text-base md:text-lg">
            {t("share.scanToOpen")}
          </p>
          <div className="rounded-2xl bg-white p-2 shadow-lg sm:p-3 md:p-4">
            <QRCode
              value={appUrl}
              size={qrSize}
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
            className="font-['Heebo'] mt-2 text-sm text-[#9FE4FD] underline underline-offset-2 hover:text-[#B7ECF7] sm:mt-3 md:text-base"
          >
            {appUrl}
          </a>
        </div>

        <div className="mx-auto grid w-full grid-cols-3 gap-3 px-2 sm:gap-4 sm:px-4 md:gap-5 md:px-6 lg:gap-6 lg:px-8 xl:gap-8 xl:px-10 2xl:gap-10 2xl:px-12">
          {DILEMMA_IDS.map((id, index) => {
            const stats = statsList[index] ?? null;
            const titleKey = `dilemmas.${id}.title`;
            const title = t(titleKey);
            const imageSrc = DILEMMA_IMAGES[id];
            return (
              <div
                key={id}
                className="relative min-w-[200px] max-w-[800px] overflow-hidden rounded-xl border-2 border-[#9FE4FD]/50 bg-black/30 shadow-lg backdrop-blur-sm sm:rounded-2xl"
              >
                <div className="relative h-32 w-full shrink-0 sm:h-40 md:h-44 lg:h-48 xl:h-56 2xl:h-64">
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
                <div className="p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 2xl:p-10">
                  <h2 className="font-['Heebo'] mb-2 text-center text-sm font-bold text-[#E6F8F9] sm:mb-3 sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
                    {title}
                  </h2>
                  <div className="flex flex-col gap-2 text-center sm:gap-3">
                    {stats && (
                      <div className="flex h-16 items-end justify-center gap-2 sm:h-20 sm:gap-2.5 md:h-24 md:gap-3 lg:h-28 lg:gap-3 xl:h-32 xl:gap-4 2xl:h-36 2xl:gap-4">
                        {(["A", "B", "C"] as const).map((opt) => {
                          const pct = stats.optionPercents?.[opt];
                          if (pct == null) return null;
                          return (
                            <div
                              key={opt}
                              className="flex h-full flex-col items-center gap-0.5 sm:gap-1"
                            >
                              <div className="flex min-w-7 flex-1 flex-col justify-end sm:min-w-9 md:min-w-10 xl:min-w-12 2xl:min-w-14">
                                <div
                                  className="mx-auto w-full max-w-9 rounded-t bg-[#9FE4FD]/80 transition-all duration-300 sm:max-w-10 md:max-w-12 xl:max-w-14 2xl:max-w-16"
                                  style={{ height: `${Math.max(8, pct)}%` }}
                                />
                              </div>
                              <span className="font-['Heebo'] text-xs font-medium text-[#E6F8F9] sm:text-sm md:text-base xl:text-lg 2xl:text-xl">
                                {opt} {formatPercent(pct)}%
                              </span>
                            </div>
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
