import { getAuthenticatedUserData } from "@/actions/get-authenticated-user-data";
import { ClosestVendorProfiles } from "@/features/closest-vendor-profiles/closest-vendor-profiles";
import { ClosestVendorProfilesLoading } from "@/features/closest-vendor-profiles/closest-vendor-profiles-loading";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const UserOnboarding = dynamic(() =>
  import("@/features/user-onboarding/user-onboarding").then((mod) => mod.UserOnboarding)
);

export default async function Home() {
  const userData = await getAuthenticatedUserData();

  return (
    <div className="flex flex-col gap-5 px-5">
      {userData && userData.is_onboarded && (
        <div>
          <h1>
            Welcome {userData.first_name} {userData.last_name}
          </h1>
        </div>
      )}
      {userData && !userData.is_onboarded && <UserOnboarding />}
      <Suspense fallback={<ClosestVendorProfilesLoading />}>
        <ClosestVendorProfiles />
      </Suspense>
    </div>
  );
}
