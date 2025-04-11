import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";

const signUpSchema = z.object({
  name: z.string().min(1, "Ce nom n'est pas valide."),
  email: z
    .string()
    .min(1, "Le courriel est requis")
    .email("Cette adresse courriel n'est pas valide."),
});

export type FormData = z.infer<typeof signUpSchema>;

export const useSignUpEmailForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const name = useUserStore((state) => state.name);
  const signInWithOtp = useUserStore((state) => state.signInWithOtp);
  const updateName = useUserStore((state) => state.updateName);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: name || "",
      email: "",
    },
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      if (!name) {
        updateName(data.name);
      }

      await signInWithOtp(data.email, data.name);

      router.push(`/auth/verify-otp?email=${data.email}`);
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
