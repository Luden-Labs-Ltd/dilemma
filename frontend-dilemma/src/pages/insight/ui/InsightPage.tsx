import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "@/entities/dilemma";
import { useDilemmaData } from "@/entities/dilemma";
import { useRTLAnimation } from "@/shared/hooks";
import slideInsightBackground from "@/shared/assets/dilemmas/common/insight-background.png?format=webp";
import { isModernThemeDilemma } from "@/shared/config/dilemma-theme";
import modernThemeInsightFrame from "@/shared/assets/dilemmas/doctor/insight-frame.png?format=webp";
import aiPersona from "./assets/ai-persona.png?format=webp";
import logoImg from "@/shared/assets/logo.png?format=webp";
import backgroundGradient from "@/shared/assets/background-gradient.png?format=webp";

export function InsightPage() {
  const { t, i18n } = useTranslation();
  const containerAnimation = useRTLAnimation({ duration: 0.5 });
  const contentAnimation = useRTLAnimation({ duration: 0.5, delay: 0.45 });
  const navigate = useNavigate();
  const { currentDilemma, choice } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);

  // Статические ответы вместо AI (разделены по языкам)
  const counterArguments = useMemo(() => {
    if (!choice) return null;
    
    const currentLang = i18n.language;
    const isHebrew = currentLang === "he";
    
    if (choice === "A") {
      if (isHebrew) {
        return [
          "שתיקה אסטרטגית (מתוך רצון להציל חיים רבים יותר)",
          "במסורת היהודית הכלל המנחה הוא ש\"אין דוחים נפש מפני נפש\", אולם קיימים מקרים שבהם ניתן להחריג כלל זה לטובת תועלת הרבים. הנביאים וחכמינו העניקו למלכות את הכוח והסמכות להכריע בשאלות של חיי אדם. עם זאת, נשאלת השאלה: האם לאחר קבלת ההחלטה, מוטלת על קובעי המדיניות אחריות אישית לתוצאותיה?",
          "פרסום אזהרה (מתוך הבנה שלא ניתן להסתיר מידע מציל חיים)",
          "בעולם היהודי קיימת חובת אזהרה כלפי אדם הנמצא בסכנה, כפי שנאמר: \"לֹא תַעֲמֹד עַל דַּם רֵעֶךָ\". על קובעי המדיניות להימנע מהחלטות העלולות לסכן את הציבור, או כאלו שיובילו בעתיד לשבירת אמון הציבור בהנהגה עקב השתקה אסטרטגית. השאלה היא כיצד תתמודד ההנהגה עם מחיר כבד של אובדן חיי אדם במידה שיתרחש? האם במקרה כזה לא ייחשב הדבר כמעילה בתפקידם להגן על שלום הציבור הכלל המנחה הוא ש\"אין דוחים נפש מפני נפש\", אולם קיימים מקרים שבהם ניתן להחריג כלל זה לטובת תועלת הרבים. הנביאים וחכמינו העניקו למלכות את הכוח והסמכות להכריע בשאלות של חיי אדם. עם זאת, נשאלת השאלה: האם לאחר קבלת ההחלטה, מוטלת על קובעי המדיניות אחריות אישית לתוצאותיה?"
        ];
      } else {
        return [
          "Strategic Silence (in order to save a greater number of lives)",
          "In Jewish tradition, the guiding principle is that one life may not be set aside for another. However, there are exceptional cases in which this principle may be overridden for the sake of the public good. The prophets and the Sages granted sovereign authority the power and responsibility to decide matters of life and death. This raises a further question: once such a decision is made, do policymakers bear personal responsibility for its consequences?",
          "Issuing a Warning (based on the view that life-saving information cannot be withheld)",
          "In Jewish tradition, there is an obligation to warn a person who is in danger, as stated: \"Do not stand idly by the blood of your fellow.\" Leaders are required to avoid decisions that may endanger the public or undermine public trust through strategic silence. The question then becomes: how should leadership confront the heavy cost of loss of life if it occurs? Would such an outcome be considered a failure in their duty to safeguard the well-being of the public?"
        ];
      }
    } else {
      if (isHebrew) {
        return [
          "פרסום אזהרה (מתוך הבנה שלא ניתן להסתיר מידע מציל חיים)",
          "בעולם היהודי קיימת חובת אזהרה כלפי אדם הנמצא בסכנה, כפי שנאמר: \"לֹא תַעֲמֹד עַל דַּם רֵעֶךָ\". על קובעי המדיניות להימנע מהחלטות העלולות לסכן את הציבור, או כאלו שיובילו בעתיד לשבירת אמון הציבור בהנהגה עקב השתקה אסטרטגית. השאלה היא כיצד תתמודד ההנהגה עם מחיר כבד של אובדן חיי אדם במידה שיתרחש? האם במקרה כזה לא ייחשב הדבר כמעילה בתפקידם להגן על שלום הציבור"
        ];
      } else {
        return [
          "Issuing a Warning (based on the view that life-saving information cannot be withheld)",
          "In Jewish tradition, there is an obligation to warn a person who is in danger, as stated: \"Do not stand idly by the blood of your fellow.\" Leaders are required to avoid decisions that may endanger the public or undermine public trust through strategic silence. The question then becomes: how should leadership confront the heavy cost of loss of life if it occurs? Would such an outcome be considered a failure in their duty to safeguard the well-being of the public?"
        ];
      }
    }
  }, [choice, i18n.language]);



  if (!currentDilemma || !choice || !dilemma) {
    navigate("/");
    return null;
  }

  const isModernTheme = isModernThemeDilemma(currentDilemma);
  /** Цвет фона под рамкой insight-frame-ai-autonomy — совпадает с краями картинки */
  const insightFrameBg = "#050a12";

  const handleNext = () => {
    navigate("/stats");
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center overflow-y-auto p-4"
      style={isModernTheme ? { backgroundColor: insightFrameBg } : { backgroundImage: `url(${backgroundGradient})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <img
        src={logoImg}
        alt=""
        aria-hidden="true"
        className="mb-4 h-auto w-[min(200px,50vw)] max-w-[260px] shrink-0 object-contain"
      />
      {isModernTheme && (
        <img src={aiPersona} alt="ai" className="w-24 mb-4 shrink-0 sm:hidden" />
      )}

      <motion.div
        {...containerAnimation}
        initial={{ ...containerAnimation.initial, scale: 0.95 }}
        animate={{ ...containerAnimation.animate, scale: 1 }}
        transition={{ ...containerAnimation.transition, ease: "easeInOut" }}
        className="relative flex w-full max-w-[95vw] flex-col items-center justify-center rounded-xl py-8 px-6 sm:py-10 sm:px-8 md:max-w-2xl md:py-12 md:px-10 lg:max-w-3xl xl:max-w-4xl shrink-0"
        style={{
          ...(isModernTheme && { backgroundColor: insightFrameBg }),
          backgroundImage: `url(${isModernTheme ? modernThemeInsightFrame : slideInsightBackground})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundBlendMode: isModernTheme ? "normal" : "multiply",
        }}
      >
        <img
          src={aiPersona}
          alt="ai"
          className={`shrink-0 ${
            isModernTheme
              ? "hidden sm:block sm:w-24 md:w-28 lg:w-32 mb-4 md:mb-6"
              : "w-16 sm:w-24 md:w-28 mb-3 sm:mb-4"
          }`}
        />

        <motion.div
          {...contentAnimation}
          initial={{ ...contentAnimation.initial, y: 20 }}
          animate={{ ...contentAnimation.animate, y: 0 }}
          className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center"
        >
          {isModernTheme ? (
            <>
              <span className="text-[#bbeff3] text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 shrink-0">
                {t("insight.aiAutonomy.thankYouTitle")}
              </span>
              <p
                className="text-white text-sm sm:text-base md:text-lg leading-relaxed text-start w-full"
                style={{ direction: i18n.language === "he" ? "rtl" : "ltr" }}
              >
                {t("insight.aiAutonomy.verseBody")}
              </p>
            </>
          ) : (
            <>
              {!!counterArguments?.length && (
                <span className="text-[#bbeff3] text-base sm:text-lg md:text-xl font-bold mb-3 shrink-0">
                  {t("insight.aiFeedback.title")}
                </span>
              )}
              {counterArguments !== null && (
                <>
                  {counterArguments.length === 0 ? (
                    <p className="text-[#bbeff3] text-sm sm:text-base">{t("insight.aiFeedback.empty")}</p>
                  ) : (
                    <ul className="list-inside list-disc space-y-3 text-start text-white text-sm sm:text-base md:text-lg leading-relaxed w-full">
                      {counterArguments.map((arg, i) => (
                        <li key={i}>{arg}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="mx-auto mt-6 mb-4 block rounded-[4px] bg-[#E4FFFF] px-10 py-3 font-bold text-black shadow-lg transition-all hover:bg-[#BAEDF0] hover:shadow-xl shrink-0"
      >
        {t("insight.next")}
      </motion.button>
    </div>
  );
}
