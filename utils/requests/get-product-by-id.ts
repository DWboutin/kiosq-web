import { cacheKeys } from "@/utils/cache-keys";
import { ProductWithVariantsPricesAndProfile } from "@/utils/factories/product-factory";
import { getBaseUrl } from "@/utils/get-base-url";

export const getProductById = async (
  productId: string
): Promise<ProductWithVariantsPricesAndProfile> => {
  try {
    const cacheInfo = cacheKeys.productById(productId);

    const response = await fetch(`${getBaseUrl()}/api/products/${productId}`, {
      next: {
        tags: [cacheInfo.tag],
        revalidate: cacheInfo.revalidate,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Client Request - Error response:", errorText);
      throw new Error(`Failed to fetch product ${productId}`);
    }

    const data = await response.json();

    return data.product;
  } catch (error) {
    console.error("Error fetching product by id", error);
    throw new Error("Failed request for product by id");
  }
};
