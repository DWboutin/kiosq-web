import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const createSignInSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().min(1, t("formEmailRequired")).email(t("formEmailInvalid")),
  });

export type FormData = z.infer<ReturnType<typeof createSignInSchema>>;

export const useSignInEmailForm = () => {
  const t = useTranslations("SignIn");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const signInWithOtp = useUserStore((state) => state.signInWithOtp);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(createSignInSchema(t)),
    mode: "onBlur",
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      await signInWithOtp(data.email);

      router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  });

  return {
    selectors: {
      control,
      errors,
      isLoading,
    },
    actions: {
      handleFormSubmit,
    },
  };
};
