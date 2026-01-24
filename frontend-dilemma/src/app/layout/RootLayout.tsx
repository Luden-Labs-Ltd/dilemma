import { Outlet, useLocation } from "react-router-dom";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";

export function RootLayout() {
  const location = useLocation();
  const isPresentationPage = location.pathname === "/presentation";

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/src/shared/assets/background-gradient.png')",
      }}
    >
      {!isPresentationPage && (
        <header className="flex justify-end px-4 pt-4">
          <LanguageSwitcher />
        </header>
      )}
      <main className="pt-2">
        <Outlet />
      </main>
    </div>
  );
}
