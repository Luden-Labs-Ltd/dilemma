import { useTranslation } from "react-i18next";
import type { DilemmaType, Choice, DilemmaOption } from "@/shared/types";

export function useDilemmaData(dilemmaId: DilemmaType | null) {
  const { t } = useTranslation();

  if (!dilemmaId) return null;

  const options: DilemmaOption[] = [
    { id: "A", label: t(`dilemmas.${dilemmaId}.options.a`) },
    { id: "B", label: t(`dilemmas.${dilemmaId}.options.b`) },
  ];

  if (dilemmaId === "state") {
    const cLabel = t("dilemmas.state.options.c");
    if (cLabel && cLabel !== "dilemmas.state.options.c") {
      options.push({ id: "C", label: cLabel });
    }
  }

  return {
    id: dilemmaId,
    title: t(`dilemmas.${dilemmaId}.title`),
    subtitle: t(`dilemmas.${dilemmaId}.subtitle`),
    description: t(`dilemmas.${dilemmaId}.description`),
    questionText: t(`dilemmas.${dilemmaId}.questionText`),
    reflectionText: t(`dilemmas.${dilemmaId}.reflectionText`),
    options,
    sources: ["1", "2", "3", "4"].map((sourceId) => ({
      id: sourceId,
      title: t(`dilemmas.${dilemmaId}.sources.${sourceId}.title`),
      subtitle: t(`dilemmas.${dilemmaId}.sources.${sourceId}.subtitle`),
      content: t(`dilemmas.${dilemmaId}.sources.${sourceId}.content`),
    })),
  };
}

