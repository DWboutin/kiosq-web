"use client";

import { FC } from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { useSignInEmailForm } from "../hooks/use-sign-in-email-form";

export const SignInEmailForm: FC = () => {
  const {
    selectors: { errors, control, isLoading },
    actions: { handleFormSubmit },
  } = useSignInEmailForm();

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-sm">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <FormInputContainer
            inputId="name"
            label="Nom complet"
            error={errors.name?.message}
            required
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input id="name" placeholder="John Doe" aria-invalid={!!errors.name} {...field} />
              )}
            />
          </FormInputContainer>

          <FormInputContainer
            inputId="email"
            label="Courriel"
            error={errors.email?.message}
            required
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  aria-invalid={!!errors.email}
                  {...field}
                />
              )}
            />
          </FormInputContainer>

          <div className="mt-2">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Chargement..." : "Continuer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
