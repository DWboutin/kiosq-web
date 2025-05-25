import { getTranslations } from "next-intl/server";

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const t = await getTranslations("ProductPage");

  return <div>{t("title", { productId })}</div>;
}
