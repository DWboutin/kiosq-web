"use client";

import { ButtonBrand } from "@/components/ui/button-brand";
import { Badge } from "@/components/ui/badge";
import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { useTranslations } from "next-intl";
import { useStripeConnect } from "./hooks/use-stripe-connect";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useProfileInvalidator } from "@/utils/invalidators-hooks/use-profile-invalidator";

export const StripeConnect = () => {
  const t = useTranslations("StripeConnect");
  const searchParams = useSearchParams();
  const {
    selectors: { profiles },
  } = useCurrentUserProfiles();

  const { connect, isLoading, error, clearError } = useStripeConnect();
  const { invalidate } = useProfileInvalidator();

  const vendorProfile = profiles.find((profile) => profile.type === "vendor");
  const isConnected = vendorProfile?.stripeAccountId;

  // Handle URL params for success/error states
  useEffect(() => {
    const stripeConnected = searchParams.get("stripe_connected");
    const stripeError = searchParams.get("stripe_error");

    if (stripeConnected === "true") {
      // Refresh profile data and clean up URL
      invalidate();
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (stripeError === "true") {
      // Handle error state
      clearError();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, clearError, invalidate]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  if (!vendorProfile) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t("title")}</h3>
      </div>

      <p className="text-sm text-muted-foreground">{t("description")}</p>

      {isConnected ? (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {t("connected")}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {t("accountId")}: {vendorProfile.stripeAccountId}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <ButtonBrand onClick={handleConnect} disabled={isLoading} className="w-fit">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("connecting")}
              </>
            ) : (
              t("connectButton")
            )}
          </ButtonBrand>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
};
