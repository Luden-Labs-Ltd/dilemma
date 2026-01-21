import { useTranslation } from "react-i18next";
import type { DilemmaType } from "@/shared/types";

export function useDilemmaData(dilemmaId: DilemmaType | null) {
  const { t } = useTranslation();

  if (!dilemmaId) return null;

  return {
    id: dilemmaId,
    title: t(`dilemmas.${dilemmaId}.title`),
    subtitle: t(`dilemmas.${dilemmaId}.subtitle`),
    description: t(`dilemmas.${dilemmaId}.description`),
    questionText: t(`dilemmas.${dilemmaId}.questionText`),
    reflectionText: t(`dilemmas.${dilemmaId}.reflectionText`),
    options: [
      {
        id: "a" as const,
        label: t(`dilemmas.${dilemmaId}.options.a`),
      },
      {
        id: "b" as const,
        label: t(`dilemmas.${dilemmaId}.options.b`),
      },
    ],
    sources: ["1", "2", "3", "4"].map((sourceId) => ({
      id: sourceId,
      title: t(`dilemmas.${dilemmaId}.sources.${sourceId}.title`),
      subtitle: t(`dilemmas.${dilemmaId}.sources.${sourceId}.subtitle`),
      content: t(`dilemmas.${dilemmaId}.sources.${sourceId}.content`),
    })),
  };
}

export function useDilemmaList() {
  const { t } = useTranslation();

  const dilemmaIds: DilemmaType[] = ["medical", "professional", "state"];

  return dilemmaIds.map((id) => ({
    id,
    title: t(`dilemmas.${id}.title`),
  }));
}
