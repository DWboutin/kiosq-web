import { cacheKeys } from "@/utils/cache-keys";
import { ProductWithVariantsPricesAndProfile } from "@/utils/factories/product-factory";
import { getBaseUrl } from "@/utils/get-base-url";

export const getRelatedProducts = async (
  productId: string
): Promise<ProductWithVariantsPricesAndProfile[]> => {
  try {
    const cacheInfo = cacheKeys.relatedProducts(productId);

    const response = await fetch(`${getBaseUrl()}/api/products/${productId}/related-products`, {
      next: {
        tags: [cacheInfo.tag],
        revalidate: cacheInfo.revalidate,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Client Request - Error response:", errorText);
      throw new Error(`Failed to fetch related products for product ${productId}`);
    }

    const data = await response.json();

    return data.products;
  } catch (error) {
    console.error("Error fetching related products for product", error);
    throw new Error("Failed request for related products for product");
  }
};
