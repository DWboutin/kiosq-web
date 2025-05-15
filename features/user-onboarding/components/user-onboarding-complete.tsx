import { FC } from "react";
import { CheckCircle } from "lucide-react";

export const UserOnboardingComplete: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
      <div className="rounded-full bg-green-50 p-3">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-xl font-bold">All Set!</h3>
      <p className="text-muted-foreground">
        Thank you for completing your profile. You&apos;re all set to explore the app!
      </p>
    </div>
  );
};
