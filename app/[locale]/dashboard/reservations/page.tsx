import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { cacheKeys } from "@/utils/cache-keys";
import { fetchServerAuthenticated } from "@/utils/fetch-server-authenticated";
import { getBaseUrl } from "@/utils/get-base-url";
import { getTranslations } from "next-intl/server";

const getUserReservations = async () => {
  const response = await fetchServerAuthenticated(
    `${getBaseUrl()}/api/users/current/reservations`,
    {
      next: {
        tags: [cacheKeys.currentUserReservations.list.tag],
        revalidate: cacheKeys.currentUserReservations.list.revalidate,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user reservations");
  }

  const data = await response.json();
  const reservations = data.reservations;

  return reservations;
};

export default async function DashboardReservationsPage() {
  const t = await getTranslations("DashboardReservationsHeader");
  const reservations = await getUserReservations();

  console.log(reservations);

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeading title={t("title")} description={t("description")} headingLevel="h2" />
      <div>
        <h2>Reservations</h2>
      </div>
    </div>
  );
}
