import { DashboardProfileProductById } from "@/components/client-pages/dashboard-profile-product-by-id/dashboard-profile-product-by-id";
import { Locales } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { fetchServerAuthenticated } from "@/utils/fetch-server-authenticated";
import { getLocale } from "next-intl/server";

const getProduct = async (productId: string) => {
  const response = await fetchServerAuthenticated(
    `http://localhost:3000/api/users/current/product/${productId}`,
    {
      next: {
        tags: [cacheKeys.currentUserProductById(productId).tag],
        revalidate: cacheKeys.currentUserProductById(productId).revalidate,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const data = await response.json();
  const product = data.product;

  return product;
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ profileId: string; productId: string }>;
}) => {
  const locale = (await getLocale()) as Locales;
  const { productId } = await params;
  const product = await getProduct(productId);

  return {
    title: product.nameTranslations[locale],
    description: product.descriptionTranslations[locale],
  };
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ profileId: string; productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProduct(productId);

  return <DashboardProfileProductById productData={product} />;
}
