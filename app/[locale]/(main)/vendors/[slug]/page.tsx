import { VendorProductsInfiniteList } from "@/features/vendor-products-infinite-list/vendor-products-infinite-list";
import { Locales } from "@/types/app";
import { getProductFromVendorId } from "@/utils/requests/get-product-from-vendor-id";
import { getVendorProfileFromSlug } from "@/utils/requests/get-vendor-profile-from-slug";

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string; locale: Locales }>;
}) {
  const { slug, locale } = await params;
  const vendor = await getVendorProfileFromSlug(slug, locale);
  const productsResponse = await getProductFromVendorId({
    vendorId: vendor.id,
    limit: 10,
    skip: 0,
  });

  return (
    <div className="container mx-auto max-sm:px-4 py-5">
      <VendorProductsInfiniteList initialProductsResponse={productsResponse} vendorId={vendor.id} />
    </div>
  );
}
