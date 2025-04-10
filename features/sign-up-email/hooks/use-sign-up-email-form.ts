import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
    },
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      // In a real implementation, you would:
      // 1. Call an API to send a verification email

      // Redirect to confirmation page or show success message
      console.log("Form submitted successfully", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to success page (in a real app, use your router)
      // router.push(`/auth/email-sent?email=${data.email}`);
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
