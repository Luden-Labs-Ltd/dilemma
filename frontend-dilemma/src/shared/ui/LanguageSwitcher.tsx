import { useLanguage } from "@/shared/hooks";
import { cn } from "@/shared/lib";

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
      <button
        onClick={() => changeLanguage("en")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          currentLanguage === "en"
            ? "bg-white shadow-sm"
            : "text-neutral-600 hover:text-neutral-900"
        )}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("he")}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          currentLanguage === "he"
            ? "bg-white shadow-sm"
            : "text-neutral-600 hover:text-neutral-900"
        )}
      >
        עב
      </button>
    </div>
  );
}
