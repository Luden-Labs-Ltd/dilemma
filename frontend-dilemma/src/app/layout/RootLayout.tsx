import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";

export function RootLayout() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/src/shared/assets/background-gradient.png')",
      }}
    >
      <header className="flex justify-end px-4 pt-4">
        <LanguageSwitcher />
      </header>
      <main className="pt-2">
        <Outlet />
      </main>
    </div>
  );
}
