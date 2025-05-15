import { UserOnboarding } from "@/features/user-onboarding/user-onboarding";

export default function Home() {
  return (
    <div className="flex flex-col gap-5">
      <UserOnboarding />
    </div>
  );
}
