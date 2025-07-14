import { useState } from "react";
import { useTranslations } from "next-intl";
import { getStripeConnectLink } from "@/actions/get-stripe-connect-link";
import { useLocale } from "next-intl";
import { Locales } from "@/types/app";

export const useStripeConnect = () => {
  const locale = useLocale() as Locales;
  const t = useTranslations("StripeConnect");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the server action to get the Stripe Connect URL
      const result = await getStripeConnectLink({ locale });
      if (!result?.connectUrl) {
        throw new Error(t("connectionFailed"));
      }
      // Redirect to Stripe Connect
      window.location.href = result.connectUrl;
    } catch (error) {
      console.error("Error connecting to Stripe:", error);
      setError(error instanceof Error ? error.message : t("connectionFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    connect,
    isLoading,
    error,
    clearError,
  };
};
