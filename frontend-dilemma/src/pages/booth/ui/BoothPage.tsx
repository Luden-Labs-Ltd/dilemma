import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import boothBackground from "@/shared/assets/dilemmas/common/reason-background.png";

const REDIRECT_DELAY_MS = 7000;

export function BoothPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#061E35] cursor-pointer"
      onClick={() => navigate("/", { replace: true })}
    >
      <div
        className="absolute inset-0 z-0 bg-black/32 pointer-events-none"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-[95vw] max-w-[2000px] aspect-[1.85] sm:aspect-[2.25] md:aspect-[2.75] mx-4"
        style={{
          backgroundImage: `url(${boothBackground})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-[14%] py-[12%] sm:px-[12%] sm:py-[10%] md:px-[10%] md:py-[8%] lg:px-[8%] lg:py-[6%] xl:px-[6%] xl:py-[5%]"
        >
          <p className="text-[clamp(12px,2.5vw,18px)] sm:text-[clamp(14px,2.2vw,22px)] xl:text-[clamp(16px,2vw,28px)] 2xl:text-[clamp(18px,1.8vw,32px)] text-cyan-100/90 leading-relaxed">
            {t("booth.description")}
          </p>
          <p className="mt-2 sm:mt-3 md:mt-4 text-[clamp(12px,2.5vw,18px)] sm:text-[clamp(14px,2.2vw,22px)] xl:text-[clamp(16px,2vw,28px)] 2xl:text-[clamp(18px,1.8vw,32px)] text-cyan-300 font-semibold leading-relaxed">
            {t("booth.cta")}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
