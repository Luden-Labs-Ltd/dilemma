import { useTranslation } from "react-i18next";
import type { DilemmaType } from "@/shared/types";

export function useDilemmaData(dilemmaId: DilemmaType | null) {
  const { t } = useTranslation();

  if (!dilemmaId) return null;

  const base = {
    id: dilemmaId,
    title: t(`dilemmas.${dilemmaId}.title`),
    subtitle: t(`dilemmas.${dilemmaId}.subtitle`),
    description: t(`dilemmas.${dilemmaId}.description`),
    questionText: t(`dilemmas.${dilemmaId}.questionText`),
    reflectionText: t(`dilemmas.${dilemmaId}.reflectionText`),
  };

  if (dilemmaId === "privacy-vs-security") {
    return {
      ...base,
      options: [
        { id: "a" as const, label: t("dilemmas.privacy-vs-security.options.a"), image: "" },
        { id: "b" as const, label: t("dilemmas.privacy-vs-security.options.b"), image: "" },
        { id: "c" as const, label: t("dilemmas.privacy-vs-security.options.c"), image: "" },
      ],
      sources: [],
      image: "",
    };
  }

  return {
    ...base,
    options: [
      { id: "a" as const, label: t(`dilemmas.${dilemmaId}.options.a`), image: "" },
      { id: "b" as const, label: t(`dilemmas.${dilemmaId}.options.b`), image: "" },
    ],
    sources: ["1", "2", "3", "4"].map((sourceId) => ({
      id: sourceId,
      title: t(`dilemmas.${dilemmaId}.sources.${sourceId}.title`),
      subtitle: t(`dilemmas.${dilemmaId}.sources.${sourceId}.subtitle`),
      content: t(`dilemmas.${dilemmaId}.sources.${sourceId}.content`),
    })),
    image: "",
  };
}

