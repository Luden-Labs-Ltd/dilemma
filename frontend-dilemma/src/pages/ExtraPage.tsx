import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDilemma } from "../app/context";

export function ExtraPage() {
  const navigate = useNavigate();
  const { currentDilemma, choice } = useDilemma();

  useEffect(() => {
    // Проверяем наличие необходимых данных
    if (!currentDilemma || !choice) {
      navigate("/");
      return;
    }

    // Сразу перенаправляем на страницу insight, минуя карусель
    navigate("/insight");
  }, [currentDilemma, choice, navigate]);

  return null;
}
