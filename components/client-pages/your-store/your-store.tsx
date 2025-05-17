"use client";

import { CreateProfileWizard } from "@/features/create-profile-wizard/create-profile-wizard";
import { cacheKeys } from "@/utils/cache-keys";
import { getAuthenticatedUserProfile } from "@/utils/requests/get-authenticated-user-profiles";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";

export const YourStore: FC = () => {
  const {
    data: profiles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: cacheKeys.userProfiles.list.queryKey,
    queryFn: getAuthenticatedUserProfile,
  });
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
