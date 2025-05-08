import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";
import { useCountdownInSeconds } from "@/hooks/use-countdown-in-seconds";
import { useTranslations } from "next-intl";

const otpSchema = z.object({
  email: z.string().email("L'email est invalide"),
  otp: z.string().length(6, "Le code doit contenir exactement 6 chiffres"),
});

export type FormData = z.infer<typeof otpSchema>;

export const useVerifyOtpForm = () => {
  const router = useRouter();
  const t = useTranslations("VerifyOtpForm");
  const { countdown, setCountdown } = useCountdownInSeconds(60);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const connectWithOtp = useUserStore((state) => state.connectWithOtp);
  const signInWithOtp = useUserStore((state) => state.signInWithOtp);
  const name = useUserStore((state) => state.name);
  const emailSearchParam = searchParams.get("email");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      email: emailSearchParam || "",
      otp: "",
    },
    resolver: zodResolver(otpSchema),
    mode: "onChange",
  });
  const email = watch("email");

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      await connectWithOtp(email, data.otp);

      router.push("/");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Le code OTP est invalide");
    } finally {
      setIsLoading(false);
    }
  });

  const handleOtpChange = (value: string) => {
    setValue("otp", value, { shouldValidate: true });
  };

  const errorSignInRedirection = () => {
    toast.warning(t("aNewCodeRequestErrorNoEmail"), {
      duration: 5000,
    });
    router.push("/auth/sign-in");
  };

  const handleAskForNewCode = async () => {
    if (!name || !email) {
      errorSignInRedirection();
      return;
    }

    try {
      await signInWithOtp(email, name);
      setCountdown(60);

      toast.success(t("aNewCodeHasBeenSent"));
    } catch (error) {
      console.error("Error asking for new code:", error);
      toast.error(t("aNewCodeRequestError"));
    }
  };

  useEffect(() => {
    if (!!errors.email) {
      errorSignInRedirection();
    }
  }, [errors]);

  return {
    selectors: {
      control,
      errors,
      isLoading,
      countdown,
    },
    actions: {
      handleFormSubmit,
      handleOtpChange,
      handleAskForNewCode,
    },
  };
};
