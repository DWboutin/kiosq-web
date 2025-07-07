import { Pagination } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { ProductWithVariantsAndPrices } from "@/utils/factories/product-factory";
import { getBaseUrl } from "@/utils/get-base-url";

export type GetProductFromVendorIdResponse = {
  products: ProductWithVariantsAndPrices[];
  pagination: Pagination;
};

export const getProductFromVendorId = async ({
  vendorId,
  limit,
  skip,
}: {
  vendorId: string;
  limit: number;
  skip: number;
}): Promise<GetProductFromVendorIdResponse> => {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/profiles/${vendorId}/products?limit=${limit}&skip=${skip}`,
      {
        next: {
          revalidate: cacheKeys.vendorProfileProducts(vendorId).revalidate,
          tags: [cacheKeys.vendorProfileProducts(vendorId).tag],
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed request for products");
  }
};
