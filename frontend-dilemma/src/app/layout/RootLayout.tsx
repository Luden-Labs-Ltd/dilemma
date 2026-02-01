import { Outlet, useLocation } from "react-router-dom";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import backgroundGradient from "@/shared/assets/background-gradient.png?format=webp";

export function RootLayout() {
  const location = useLocation();
  // Страницы с собственным полноэкранным фоном — скрываем header и фон RootLayout
  const pagesWithOwnBackground = [
    "/choice",
    "/stats",
    "/insight",
    "/video",
    "/video-end",
  ];
  const hasOwnBackground = pagesWithOwnBackground.includes(location.pathname);
  const hideLanguageSwitcher = hasOwnBackground;

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={
        hasOwnBackground
          ? undefined
          : { backgroundImage: `url(${backgroundGradient})` }
      }
    >
      {!hideLanguageSwitcher && (
        <header
          dir="ltr"
          className="absolute top-0 left-0 right-0 z-30 flex justify-end px-4 pt-4 bg-transparent"
        >
          <LanguageSwitcher />
        </header>
      )}
      <main className={hasOwnBackground ? "" : "pt-2"}>
        <Outlet />
      </main>
    </div>
  );
}
