import { cacheKeys } from "@/utils/cache-keys";
import { AuthenticatedUserProductWithVariantsAndPrices } from "@/utils/factories/authenticated-user-product-factory";

export const getAuthenticatedUserProductById = async (
  productId: string
): Promise<AuthenticatedUserProductWithVariantsAndPrices> => {
  try {
    const cacheInfo = cacheKeys.currentUserProductById(productId);
    const response = await fetch(`/api/users/current/product/${productId}`, {
      next: {
        tags: [cacheInfo.tag],
        revalidate: cacheInfo.revalidate,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user's product id ${productId}`);
    }

    const data = await response.json();

    return data.product;
  } catch (error) {
    console.error("Error fetching authenticated user's product id", error);
    throw new Error("Failed request for authenticated user's product id");
  }
};
