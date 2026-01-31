import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "@/entities/dilemma";
import { useRTLAnimation } from "@/shared/hooks";
import { useEffect, useRef, useState } from "react";
import commanderVideoWebm from "@/shared/assets/videos/commander-he.webm";
import teacherVideoEnWebm from "@/shared/assets/videos/teacher-en.webm";
import teacherVideoHeWebm from "@/shared/assets/videos/teacher-he.webm";
import doctorVideoEnWebm from "@/shared/assets/videos/doctor-en.webm";
import doctorVideoHeWebm from "@/shared/assets/videos/doctor-he.webm";

/** Карта видео: по имени дилеммы и языку. state и professional — вторая карточка (teacher). */
const VIDEO_BY_DILEMMA_AND_LANG: Record<
  string,
  { en: string; he: string } | undefined
> = {
  // "trolley-problem": { en: commanderVideoWebm, he: commanderVideoWebm },
  commander: { en: commanderVideoWebm, he: commanderVideoWebm },
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
  const [isMuted, setIsMuted] = useState(true);
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
  //         ? commanderVideoWebm
  //         : commanderVideoWebm
  //       : undefined;
  const videoSrc = videoFromName;
  const shouldShowFullscreenVideo = Boolean(videoSrc);

  useEffect(() => {
    if (!currentDilemma && !navState?.selectedDilemmaName) {
      navigate("/");
    }
  }, [currentDilemma, navState?.selectedDilemmaName, navigate]);

  useEffect(() => {
    if (!videoSrc) return;
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => undefined);
  }, [videoSrc]);

  const handleVideoCanPlay = () => {
    videoRef.current?.play().catch(() => undefined);
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
        className="fixed inset-0 bg-black"
        onPointerDown={() => {
          // Первый тап включает звук и запускает видео (без контролов/оверлеев)
          const video = videoRef.current;
          if (!video) return;
          video.muted = false;
          setIsMuted(false);
          video.volume = 1;
          void video.play();
        }}
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
          onEnded={() => navigate("/choice")}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        >
        </video>

        {isMuted && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white shadow-[0_6px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
            Tap to unmute
          </div>
        )}
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
