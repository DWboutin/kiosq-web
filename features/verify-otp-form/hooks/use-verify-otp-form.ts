import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";

const otpSchema = z.object({
  email: z.string().email("L'email est invalide"),
  otp: z.string().length(6, "Le code doit contenir exactement 6 chiffres"),
});

export type FormData = z.infer<typeof otpSchema>;

export const useVerifyOtpForm = () => {
  const router = useRouter();
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
      // This will be replaced with Supabase verification in the future
      console.log("Verifying OTP:", data.otp);
      await connectWithOtp(email, data.otp);
      // Navigate to the desired page after verification
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

  const handleAskForNewCode = async () => {
    if (!name) {
      toast.warning(
        "Nous en pouvons pas vous envoyer un nouveau code sans votre nom, vous serez redirigé vers la page de connexion"
      );
      router.push("/auth/sign-in");
      return;
    }

    try {
      await signInWithOtp(email, name);
      toast.success("Un nouveau code vous a été envoyé");
    } catch (error) {
      console.error("Error asking for new code:", error);
      toast.error("Une erreur est survenue lors de la demande de nouveau code");
    }
  };

  return {
    selectors: {
      control,
      errors,
      isLoading,
    },
    actions: {
      handleFormSubmit,
      handleOtpChange,
      handleAskForNewCode,
    },
  };
};
