import { DashboardProfileProductById } from "@/components/client-pages/dashboard-profile-product-by-id/dashboard-profile-product-by-id";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ profileId: string; productId: string }>;
}) {
  const { productId } = await params;

  return <DashboardProfileProductById productId={productId} />;
}
