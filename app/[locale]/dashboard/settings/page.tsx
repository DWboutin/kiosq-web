import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { Card } from "@/components/ui/card";
import { SettingsReservationForm } from "@/features/settings-reservation-form/settings-reservation-form";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("DashboardSettings");

  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageHeading title={t("title")} description={t("description")} />
      <div className="flex flex-col flex-1">
        <Card className="p-6">
          <SettingsReservationForm />
        </Card>
      </div>
    </div>
  );
}
