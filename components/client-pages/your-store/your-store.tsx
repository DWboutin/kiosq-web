"use client";

import { CreateProfileWizard } from "@/features/create-profile-wizard/create-profile-wizard";
import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { FC } from "react";

export const YourStore: FC = () => {
  const {
    selectors: { profiles, isLoading, error },
  } = useCurrentUserProfiles();
  const vendorProfiles = profiles.filter((profile) => profile.type === "vendor");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      {vendorProfiles.length === 0 && <CreateProfileWizard />}
      <pre>{JSON.stringify(vendorProfiles, null, 2)}</pre>
    </>
  );
};
