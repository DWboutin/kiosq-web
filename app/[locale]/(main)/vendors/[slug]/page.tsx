import { Locales } from "@/types/app";

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string; locale: Locales }>;
}) {
  const { slug, locale } = await params;

  return (
    <div>
      <h1>Vendor Page</h1>
      <span>Slug: {slug}</span>
      <span>Locale: {locale}</span>
    </div>
  );
}
