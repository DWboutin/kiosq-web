import { VerifyOtpForm } from "@/features/verify-otp-form/verify-otp-form";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function VerifyOtpPage() {
  const t = await getTranslations("VerifyOtpForm");

  return (
    <div className="flex flex-1 flex-col gap-10 items-center justify-center">
      <div className="flex flex-col gap-4 bg-neutral-white rounded-lg p-5 shadow-lg">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
