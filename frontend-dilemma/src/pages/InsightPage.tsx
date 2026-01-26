import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData, useRTLAnimation } from "@/shared/hooks";
import slideInsightBackground from "@/shared/assets/insight.png?format=webp";
import aiPersone from "./Gemini_Generated_Image_i4v2t5i4v2t5i4v2 1.png?format=webp";

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
    
    if (choice === "a") {
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


  const handleNext = () => {
    navigate("/stats");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-2">
      {/* Картинка вне блока на мобильных */}
      <img
        src={aiPersone}
        alt="ai"
        className="w-[120px] mb-[20px] shrink-0 sm:hidden"
      />

      <motion.div
        {...containerAnimation}
        initial={{ 
          ...containerAnimation.initial,
          scale: 0.95
        }}
        animate={{ 
          ...containerAnimation.animate,
          scale: 1
        }}
        transition={{ 
          ...containerAnimation.transition,
          ease: "easeInOut"
        }}
        className="relative flex max-h-[90vw] max-w-[95vw] w-full h-full flex-col items-center justify-center overflow-hidden rounded-xl py-8 px-6"
        style={{ backgroundImage: `url(${slideInsightBackground})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundBlendMode: "multiply" }}
      >
        {/* Картинка внутри блока на планшетах и десктопе */}
        <img
          src={aiPersone}
          alt="ai"
          className="hidden sm:block sm:w-[150px] md:w-[180px] mb-[25px] md:mb-[30px] shrink-0"
        />

        {/* Блок: AI-контраргументы */}
        <motion.div
          {...contentAnimation}
          initial={{ 
            ...contentAnimation.initial,
            y: 20
          }}
          animate={{ 
            ...contentAnimation.animate,
            y: 0
          }}
          className="flex flex-col items-center justify-center text-center max-w-2xl w-full"
        >
          {
            !!counterArguments?.length && (
              <span className="text-[#bbeff3] text-xl font-bold mb-[20px]">
                {t("insight.aiFeedback.title")}
              </span>
            )
          }
          {counterArguments !== null && (
            <>
              {counterArguments.length === 0 ? (
                <p className="text-[#bbeff3]">{t("insight.aiFeedback.empty")}</p>
              ) : (
                <div className="max-h-[400px] overflow-y-auto w-full custom-scrollbar">
                  <ul className="list-inside list-disc space-y-2 sm:space-y-3 text-start text-white text-sm sm:text-base w-full pr-2">
                    {counterArguments.map((arg, i) => (
                      <li key={i} className="leading-relaxed">{arg}</li>
                    ))}
                  </ul>
                </div>
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
        className="mx-auto mt-8 mb-4 block rounded-[4px] bg-[#E4FFFF] px-10 py-3 font-bold text-black shadow-lg transition-all hover:bg-[#BAEDF0] hover:shadow-xl shrink-0"
      >
        {t("insight.next")}
      </motion.button>
      <style>{`
        .custom-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
}
