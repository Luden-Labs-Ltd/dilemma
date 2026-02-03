import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/** QR size. On mobile: match card width (viewport - padding). Desktop: fixed scales (slightly smaller). */
function getQrSize(): number {
  if (typeof window === "undefined") return 200;
  const w = window.innerWidth;
  // Mobile (<768): same width as cards (parent px-3 + grid px-3 + gap ≈ 56px)
  if (w < 768) return Math.max(120, Math.min(400, w - 56));
  if (w < 1024) return 155;
  if (w < 1280) return 165;
  // xl (1280+): 200→280px
  if (w < 1536) return Math.min(280, 200 + Math.round((w - 1280) / 2.6));
  // 2xl (1536+): 280→360px
  return Math.min(360, 280 + Math.round((w - 1536) / 4));
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
const POLL_INTERVAL_MS = 15_000;
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
    const update = () => setQrSize(getQrSize());
    update(); // run on mount in case window is already large
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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
      className="flex min-h-screen flex-col overflow-hidden bg-cover bg-center md:overflow-hidden"
      style={{ backgroundImage: `url(${backgroundGradient})` }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4 md:overflow-hidden md:px-4 md:py-3 lg:px-6 lg:py-4 xl:px-10 xl:py-5 2xl:px-12 2xl:py-6">
        <div className="mb-2 flex shrink-0 justify-center md:mb-1 lg:mb-2 xl:mb-3 2xl:mb-4">
          <img
            src={logoImg}
            alt=""
            aria-hidden="true"
            className="h-auto w-[min(160px,42vw)] max-w-[200px] object-contain sm:max-w-[220px] md:max-w-[160px] lg:max-w-[180px] xl:max-w-[260px] 2xl:max-w-[320px]"
          />
        </div>

        {error && (
          <p className="mb-1 shrink-0 text-center text-xs text-amber-300 md:mb-1 md:text-sm">
            {error}
          </p>
        )}

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 pb-2 pt-1 sm:px-4 sm:pb-3 sm:pt-2 md:pb-2 md:pt-1 lg:pb-3 lg:pt-2">
          <p className="font-['Heebo'] mb-1 text-center text-xs font-medium text-[#E6F8F9] sm:mb-2 sm:text-sm md:text-sm">
            {t("share.scanToOpen")}
          </p>
          <div className="rounded-xl bg-white p-1.5 shadow-lg sm:p-2 md:p-2 xl:p-4 2xl:p-5">
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
            className="font-['Heebo'] mt-1 text-xs text-[#9FE4FD] underline underline-offset-2 hover:text-[#B7ECF7] sm:mt-2 sm:text-sm"
          >
            {appUrl}
          </a>
        </div>

        <div className="mx-auto grid w-full min-h-0 max-w-4xl flex-1 grid-cols-1 gap-2 px-3 py-1 sm:grid-cols-2 sm:gap-3 sm:px-4 md:max-w-5xl md:grid-cols-3 md:gap-3 md:px-4 lg:max-w-6xl lg:gap-4 lg:px-6 xl:max-w-[min(1400px,90vw)] xl:gap-5 xl:px-8 2xl:max-w-[min(1800px,92vw)] 2xl:gap-6 2xl:px-10">
          {DILEMMA_IDS.map((id, index) => {
            const stats = statsList[index] ?? null;
            const titleKey = `dilemmas.${id}.title`;
            const title = t(titleKey);
            const imageSrc = DILEMMA_IMAGES[id];
            return (
              <div
                key={id}
                className="relative aspect-4/3 min-w-0 max-w-full overflow-hidden rounded-lg shadow-lg sm:min-w-[160px] sm:max-w-[400px] md:rounded-xl xl:min-w-[280px] xl:max-w-[600px] 2xl:min-w-[400px] 2xl:max-w-[800px]"
                style={{
                  border: "4px solid transparent",
                  background:
                    "linear-gradient(transparent, transparent) padding-box, linear-gradient(180deg, #CDE4FF, #72FFFF, #0657B2) border-box",
                  backgroundClip: "padding-box, border-box",
                }}
              >
                <img
                  src={imageSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.85) 100%)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-between px-2 pt-7 pb-4 sm:px-3 sm:pb-5 md:px-2.5 md:pb-4 lg:px-3 lg:pb-5 xl:px-4 xl:pb-6 2xl:px-5 2xl:pb-7">
                  <h2 className="font-['Heebo'] shrink-0 text-center text-xs font-bold text-white drop-shadow-sm sm:text-sm md:text-sm lg:text-base xl:text-lg 2xl:text-xl">
                    {title}
                  </h2>
                  {stats && (
                    <div className="flex min-h-14 shrink-0 items-end justify-center gap-2 sm:min-h-16 sm:gap-3 md:min-h-[4.5rem] md:gap-4 lg:min-h-20 lg:gap-6 xl:min-h-24 xl:gap-8 2xl:min-h-28 2xl:gap-12">
                      {(["A", "B", "C"] as const).map((opt) => {
                        const pct = stats.optionPercents?.[opt];
                        if (pct == null) return null;
                        const optionLabel =
                          id === "teacher" || id === "doctor" || id === "commander"
                            ? (() => {
                                const keyShare = `dilemmas.${id}.optionsShare.${opt.toLowerCase()}`;
                                const labelShare = t(keyShare);
                                if (labelShare !== keyShare) return labelShare;
                                const key = `dilemmas.${id}.options.${opt.toLowerCase()}`;
                                const label = t(key);
                                return label === key ? opt : label;
                              })()
                            : opt;
                        return (
                          <div
                            key={opt}
                            className="flex h-full flex-col items-center gap-0"
                          >
                            <div className="min-h-0 flex-1" aria-hidden />
                            <div
                              className="flex min-w-5 flex-col sm:min-w-6 lg:min-w-7 xl:min-w-10 2xl:min-w-12"
                              style={{ height: `${Math.max(8, pct)}%`, minHeight: 28 }}
                            >
                              <span className="font-['Heebo'] shrink-0 text-center text-[10px] font-medium leading-[1.29] text-[#B6FFFF] drop-shadow-sm sm:text-sm md:text-base lg:text-lg xl:text-[28px] xl:leading-[36px] 2xl:text-[28px] 2xl:leading-[36px]">
                                {formatPercent(pct)}%
                              </span>
                              <div className="mx-auto w-[60px] max-w-[60px] flex-1 min-h-[6px] rounded-t-[4px] bg-[#B6FFFF] transition-all duration-300" />
                            </div>
                            <span className="font-['Heebo'] mt-1 shrink-0 text-center text-[10px] font-medium text-white drop-shadow-sm sm:text-xs xl:text-sm 2xl:text-base line-clamp-2">
                              {optionLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
