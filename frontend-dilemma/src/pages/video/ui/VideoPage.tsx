import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "@/entities/dilemma";
import { useRTLAnimation } from "@/shared/hooks";
import { useEffect, useRef, useState } from "react";

type VideoPhase = "rotate-horizontal" | "video" | "rotate-vertical";
import commanderVideoEnWebm from "@/shared/assets/videos/commander-en.webm";
import commanderVideoHeWebm from "@/shared/assets/videos/commander-he.webm";
import teacherVideoEnWebm from "@/shared/assets/videos/teacher-en.webm";
import teacherVideoHeWebm from "@/shared/assets/videos/teacher-he.webm";
import doctorVideoEnWebm from "@/shared/assets/videos/doctor-en.webm";
import doctorVideoHeWebm from "@/shared/assets/videos/doctor-he.webm";
import { PhoneIcon } from "./phone-icon";

/** Карта видео: по имени дилеммы и языку. state и professional — вторая карточка (teacher). */
const VIDEO_BY_DILEMMA_AND_LANG: Record<
  string,
  { en: string; he: string } | undefined
> = {
  // "trolley-problem": { en: commanderVideoEnWebm, he: commanderVideoHeWebm },
  commander: { en: commanderVideoEnWebm, he: commanderVideoHeWebm },
  doctor: { en:  doctorVideoEnWebm, he:  doctorVideoHeWebm },
  teacher: { en: teacherVideoEnWebm, he: teacherVideoHeWebm },
};

export function VideoPage() {
  const { t, i18n } = useTranslation();
  const containerAnimation = useRTLAnimation({ duration: 0.5 });
  const videoAnimation = useRTLAnimation({ duration: 0.4, delay: 0.3 });
  const navigate = useNavigate();
  const location = useLocation();
  const { currentDilemma } = useDilemma();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasShownRotateHorizontal = useRef(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [phase, setPhase] = useState<VideoPhase>("video");
  const navState = location.state as
    | { selectedDilemmaName?: string; selectedDilemmaIndex?: number }
    | null;

  const isHebrew = i18n.language?.toLowerCase().startsWith("he");
  const langKey = isHebrew ? "he" : "en";
  const resolvedDilemmaName = navState?.selectedDilemmaName ?? currentDilemma;
  const videoFromName =
    resolvedDilemmaName &&
    VIDEO_BY_DILEMMA_AND_LANG[resolvedDilemmaName]?.[langKey];
  // const videoFromIndex =
  //   resolvedDilemmaName === "teacher"
  //     ? langKey === "he"
  //       ? teacherVideoHeWebm
  //       : teacherVideoEnWebm
  //     : resolvedDilemmaName === "doctor"
  //       ? langKey === "he"
  //         ? doctorVideoHeWebm
  //         : doctorVideoEnWebm
  //     : resolvedDilemmaName === "commander"
  //       ? langKey === "he"
  //         ? commanderVideoHeWebm
  //         : commanderVideoEnWebm
  //       : undefined;
  const videoSrc = videoFromName;
  const shouldShowFullscreenVideo = Boolean(videoSrc);

  useEffect(() => {
    if (!currentDilemma && !navState?.selectedDilemmaName) {
      navigate("/");
    }
  }, [currentDilemma, navState?.selectedDilemmaName, navigate]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobileOrTablet(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!shouldShowFullscreenVideo || !videoSrc || !isMobileOrTablet) return;
    if (hasShownRotateHorizontal.current) return;
    hasShownRotateHorizontal.current = true;
    queueMicrotask(() => setPhase("rotate-horizontal"));
  }, [shouldShowFullscreenVideo, videoSrc, isMobileOrTablet]);

  useEffect(() => {
    if (phase !== "rotate-horizontal" || !shouldShowFullscreenVideo) return;
    const timer = setTimeout(() => setPhase("video"), 3000);
    return () => clearTimeout(timer);
  }, [phase, shouldShowFullscreenVideo]);

  useEffect(() => {
    if (phase !== "rotate-vertical") return;
    const timer = setTimeout(() => navigate("/choice"), 3000);
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

  useEffect(() => {
    if (!currentDilemma) return;
    if (shouldShowFullscreenVideo) return;

    const timer = setTimeout(() => {
      navigate("/choice");
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentDilemma, shouldShowFullscreenVideo, navigate]);

  if (!currentDilemma) {
    return null;
  }

  if (shouldShowFullscreenVideo && videoSrc) {
    return (
      <div
        className="fixed inset-0 cursor-pointer bg-black"
        onPointerDown={() => {
          if (phase === "rotate-vertical") {
            navigate("/choice");
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
                key={videoSrc ?? resolvedDilemmaName ?? "video"}
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
                    : navigate("/choice")
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

  return (
    <div className="fixed inset-0 bg-black">
      <motion.div
        {...containerAnimation}
        initial={{
          ...containerAnimation.initial,
          opacity: 0,
        }}
        animate={{
          ...containerAnimation.animate,
          opacity: 1,
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          {...videoAnimation}
          initial={{
            ...videoAnimation.initial,
            scale: 0.98,
          }}
          animate={{
            ...videoAnimation.animate,
            scale: 1,
          }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-lg text-white/80">{t("video.playing")}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
