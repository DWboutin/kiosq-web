import { cacheKeys } from "@/utils/cache-keys";
import { revalidateTag } from "next/cache";

export const categoriesRevalidator = () => {
  revalidateTag(cacheKeys.productCategories.list.tag);
};
