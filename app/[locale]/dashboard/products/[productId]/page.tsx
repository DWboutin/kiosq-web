import { getUserProductById } from "@/actions/get-user-product-by-id";

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const data = await getUserProductById(productId);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
