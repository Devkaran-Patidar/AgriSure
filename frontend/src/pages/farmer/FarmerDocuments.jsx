import { useLanguage } from "../../context/LanguageContext";

export default function FarmerDocuments() {
  const { t } = useLanguage();
  return (
    <section className="section-padding bg-soft">
      <div className="container-page max-w-4xl">
        <span className="eyebrow">{t("documents")}</span>
        <h1 className="section-title">{t("farmerDocuments")}</h1>

        <div className="card mt-8 grid gap-4">
          <p className="text-sm text-slate-600">{t("documentsDescription")}</p>
          <label>
            <span className="label">{t("uploadFile")}</span>
            <input type="file" className="input" />
          </label>
          <button className="btn-primary">{t("uploadDocument")}</button>
        </div>
      </div>
    </section>
  );
}
