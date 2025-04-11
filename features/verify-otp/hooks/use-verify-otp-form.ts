import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/user-store";

const otpSchema = z.object({
  email: z.string().email("L'email est invalide"),
  otp: z.string().length(6, "Le code doit contenir exactement 6 chiffres"),
});

export type FormData = z.infer<typeof otpSchema>;

export const useVerifyOtpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const connectWithOtp = useUserStore((state) => state.connectWithOtp);
  const email = searchParams.get("email");

  console.log("email", email);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      email: email || "",
      otp: "",
    },
    resolver: zodResolver(otpSchema),
    mode: "onChange",
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      // This will be replaced with Supabase verification in the future
      console.log("Verifying OTP:", data.otp);
      await connectWithOtp(email, data.otp);
      // Navigate to the desired page after verification
      // router.push("/dashboard");
    } catch (error) {
      console.error("Error verifying OTP:", error);
    } finally {
      setIsLoading(false);
    }
  });

  const handleOtpChange = (value: string) => {
    setValue("otp", value, { shouldValidate: true });
  };

  console.log("errors", errors);

  return {
    selectors: {
      control,
      errors,
      isLoading,
    },
    actions: {
      handleFormSubmit,
      handleOtpChange,
    },
  };
};
