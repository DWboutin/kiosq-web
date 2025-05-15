"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent as BaseDialogContent,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useId } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useUserOnboarding } from "./hooks/use-user-onboarding";
import { UserOnboardingStepOne } from "./components/user-onboarding-step-one";
import { UserOnboardingStepTwo } from "./components/user-onboarding-step-two";
import { UserOnboardingStepThree } from "./components/user-onboarding-step-three";
import { UserOnboardingStepFour } from "./components/user-onboarding-step-four";
import { UserOnboardingComplete } from "./components/user-onboarding-complete";
import { UserOnboardingWelcome } from "./components/user-onboarding-welcome";
import { UserOnboardingStepHeader } from "./components/user-onboarding-step-header";
import { Loader2 } from "lucide-react";

// Custom DialogContent without close button
const DialogContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialogContent>) => (
  <DialogPortal>
    <DialogOverlay onClick={(e) => e.stopPropagation()} />
    <DialogPrimitive.Content
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
);

export const UserOnboarding = () => {
  const user = useUserStore((state) => state.user);
  const userData = useUserStore((state) => state.userData);
  const titleId = useId();
  const descriptionId = useId();

  const {
    selectors: {
      step,
      formSteps,
      isWelcomeStep,
      isFormStep,
      isLastFormStep,
      control,
      errors,
      isSubmitting,
      isComplete,
    },
    actions: { nextStep, previousStep, handleGeolocationRequest },
  } = useUserOnboarding();

  if (!user || !userData) {
    return null;
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Personal Information";
      case 2:
        return "Location Preferences";
      case 3:
        return "Select Categories";
      case 4:
        return "User Type";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Please provide your personal information to get started.";
      case 2:
        return "Set your location preferences to see content relevant to you.";
      case 3:
        return "Choose 3 categories that interest you the most.";
      case 4:
        return "Select the type of user you are to tailor your experience.";
      default:
        return "";
    }
  };

  const renderStepContent = () => {
    if (isComplete) {
      return <UserOnboardingComplete />;
    }

    if (isWelcomeStep) {
      return <UserOnboardingWelcome titleId={titleId} descriptionId={descriptionId} />;
    }

    return (
      <>
        <UserOnboardingStepHeader
          titleId={titleId}
          descriptionId={descriptionId}
          title={getStepTitle()}
          description={getStepDescription()}
        />
        <div className="p-6">
          {step === 1 && <UserOnboardingStepOne control={control} errors={errors} />}
          {step === 2 && (
            <UserOnboardingStepTwo
              control={control}
              errors={errors}
              onRequestGeolocation={handleGeolocationRequest}
            />
          )}
          {step === 3 && <UserOnboardingStepThree control={control} errors={errors} />}
          {step === 4 && <UserOnboardingStepFour control={control} errors={errors} />}
        </div>
      </>
    );
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn("p-0 overflow-hidden")}
      >
        {renderStepContent()}

        <DialogFooter className={cn("p-4", step !== 0 && "border-t border-neutral-lightest")}>
          <div className="flex flex-row justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              {isFormStep && `Step ${step}/${formSteps}`}
            </div>
            <div className="flex flex-row gap-2">
              {!isComplete && !isWelcomeStep && (
                <Button variant="outline" onClick={previousStep} disabled={isSubmitting}>
                  Back
                </Button>
              )}
              {!isComplete && (
                <Button onClick={nextStep} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLastFormStep ? "Saving..." : "Next..."}
                    </>
                  ) : (
                    <>{isWelcomeStep ? "Get Started" : isLastFormStep ? "Complete" : "Continue"}</>
                  )}
                </Button>
              )}
              {isComplete && <Button>Get Started</Button>}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
