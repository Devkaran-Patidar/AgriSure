import { Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="relative inline-flex items-center">
      <Languages
        size={15}
        strokeWidth={2}
        className="pointer-events-none absolute left-2.5 text-slate-500"
      />

      <label htmlFor="language-switcher" className="sr-only">
        {t("language")}
      </label>

      <select
        id="language-switcher"
        aria-label={t("language")}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className={`appearance-none rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer ${compact ? "w-9 pl-7 pr-0" : "pl-8 pr-7"}`}
      >
        <option value="en">EN</option>
        <option value="hi">हिंदी</option>
      </select>

      <span className={`pointer-events-none absolute right-2 text-[10px] text-slate-400${compact ? " hidden" : ""}`}>
        ▾
      </span>
    </div>
  );
}