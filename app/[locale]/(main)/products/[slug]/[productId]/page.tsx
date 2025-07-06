import { ProductDetails } from "@/features/product-details/product-details";
import { ProductDetailsProvider } from "@/features/product-details/product-details-provider";
import { getProductById } from "@/utils/requests/get-product-by-id";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProductById(productId);

  return (
    <div className="container mx-auto max-sm:px-4 py-5">
      <ProductDetailsProvider product={product}>
        <ProductDetails product={product} />
      </ProductDetailsProvider>
    </div>
  );
}
