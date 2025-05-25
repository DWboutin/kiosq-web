import { RawProductWithVariantsAndPrices } from "@/types/app";
import {
  authenticatedUserProductFactory,
  AuthenticatedUserProductWithVariantsAndPrices,
} from "@/utils/factories/authenticated-user-product-factory";

export const authenticatedUserProfileIdProductsFactory = (
  products: RawProductWithVariantsAndPrices[]
): AuthenticatedUserProductWithVariantsAndPrices[] => {
  return products.map((product) => authenticatedUserProductFactory(product));
};
