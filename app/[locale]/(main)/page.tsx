import { getAuthenticatedUserData } from "@/actions/get-authenticated-user-data";
import dynamic from "next/dynamic";

const UserOnboarding = dynamic(() =>
  import("@/features/user-onboarding/user-onboarding").then((mod) => mod.UserOnboarding)
);

export default async function Home() {
  const userData = await getAuthenticatedUserData();

  return (
    <div className="flex flex-col gap-5">
      {userData.is_onboarded ? (
        <div>
          <h1>
            Welcome {userData.first_name} {userData.last_name}
          </h1>
        </div>
      ) : (
        <UserOnboarding />
      )}
    </div>
  );
}
