import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-col gap-5">
      <h1>{t("title")}</h1>
    </div>
  );
}
