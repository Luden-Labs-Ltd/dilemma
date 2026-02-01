import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PhoneIcon } from "../../video/ui/phone-icon";
import outroWebm from "@/shared/assets/videos/outro.webm";

type VideoPhase = "rotate-horizontal" | "video" | "rotate-vertical";

/** Видео после stats. По окончании — переход на главный экран. */
const VIDEO_END_BY_LANG: { en: string; he: string } = {
  en: outroWebm,
  he: outroWebm,
};

export function VideoEndPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasShownRotateHorizontal = useRef(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [phase, setPhase] = useState<VideoPhase>("video");

  const isHebrew = i18n.language?.toLowerCase().startsWith("he");
  const langKey = isHebrew ? "he" : "en";
  const videoSrc = VIDEO_END_BY_LANG?.[langKey];
  const shouldShowVideo = Boolean(videoSrc);

  useEffect(() => {
    if (!shouldShowVideo) {
      navigate("/", { replace: true });
      return;
    }
  }, [shouldShowVideo, navigate]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobileOrTablet(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!shouldShowVideo || !videoSrc || !isMobileOrTablet) return;
    if (hasShownRotateHorizontal.current) return;
    hasShownRotateHorizontal.current = true;
    queueMicrotask(() => setPhase("rotate-horizontal"));
  }, [shouldShowVideo, videoSrc, isMobileOrTablet]);

  useEffect(() => {
    if (phase !== "rotate-horizontal" || !shouldShowVideo) return;
    const timer = setTimeout(() => setPhase("video"), 3000);
    return () => clearTimeout(timer);
  }, [phase, shouldShowVideo]);

  useEffect(() => {
    if (phase !== "rotate-vertical") return;
    const timer = setTimeout(() => navigate("/", { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [phase, navigate]);

  useEffect(() => {
    if (phase !== "video" || !videoSrc) return;
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => undefined);
  }, [phase, videoSrc]);

  const handleVideoCanPlay = () => {
    videoRef.current?.play().catch(() => undefined);
  };

  const handleOpenInPlayer = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const v = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    if (typeof v.webkitEnterFullscreen === "function") {
      v.webkitEnterFullscreen();
    } else if (typeof video.requestFullscreen === "function") {
      void video.requestFullscreen();
    }
  };

  if (!shouldShowVideo || !videoSrc) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 cursor-pointer bg-black"
      onPointerDown={() => {
        if (phase === "rotate-vertical") {
          navigate("/", { replace: true });
          return;
        }
        if (phase !== "video") return;
        const video = videoRef.current;
        if (!video) return;
        video.muted = false;
        setIsMuted(false);
        video.volume = 1;
        void video.play();
      }}
    >
      <AnimatePresence mode="wait">
        {phase === "rotate-horizontal" && (
          <motion.div
            key="rotate-horizontal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <PhoneIcon position="horizontal" />
            <p className="text-lg mt-4 sm:text-xl text-white/95 max-w-md font-medium leading-relaxed">
              {t("video.rotateHorizontal")}
            </p>
            <p className="mt-4 text-sm text-white/60">{t("common.continue")}</p>
          </motion.div>
        )}

        {phase === "video" && (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              playsInline
              controls={false}
              controlsList="nodownload noplaybackrate noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
              preload="auto"
              muted={isMuted}
              onCanPlayThrough={handleVideoCanPlay}
              onEnded={() =>
                isMobileOrTablet
                  ? setPhase("rotate-vertical")
                  : navigate("/", { replace: true })
              }
              className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
            />
            {isMuted && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white shadow-[0_6px_24px_rgba(0,0,0,0.35)] backdrop-blur-md pointer-events-none">
                Tap to unmute
              </div>
            )}
            {isMobileOrTablet && (
              <button
                type="button"
                onClick={handleOpenInPlayer}
                className="absolute top-4 right-4 rounded-full border border-white/30 bg-black/50 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70 active:bg-black/80"
              >
                {t("video.openInPlayer")}
              </button>
            )}
          </motion.div>
        )}

        {phase === "rotate-vertical" && (
          <motion.div
            key="rotate-vertical"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <PhoneIcon position="vertical" />
            <p className="text-lg mt-4 sm:text-xl text-white/95 max-w-md font-medium leading-relaxed">
              {t("video.rotateVertical")}
            </p>
            <p className="mt-4 text-sm text-white/60">{t("common.continue")}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
