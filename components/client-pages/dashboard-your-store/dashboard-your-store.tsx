"use client";

import { VendorStoreHeader } from "@/components/sections/vendor-store-header";
import { CreateProfileWizard } from "@/features/create-profile-wizard/create-profile-wizard";
import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { FC } from "react";

export const DashboardYourStore: FC = () => {
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

  if (vendorProfiles.length === 0) {
    return <CreateProfileWizard />;
  }

  const firstVendorProfile = vendorProfiles[0];

  return (
    <>
      {vendorProfiles.length === 0 && <CreateProfileWizard />}
      <VendorStoreHeader
        profileId={firstVendorProfile.id}
        bannerImageUrl={firstVendorProfile.bannerImage}
        profileImageUrl={firstVendorProfile.profileImage}
        nameTranslations={firstVendorProfile.nameTranslations}
        descriptionTranslations={firstVendorProfile.descriptionTranslations}
        facebookPageUrl={firstVendorProfile.facebookPageUrl}
        instagramPageUrl={firstVendorProfile.instagramPageUrl}
        tiktokPageUrl={firstVendorProfile.tiktokPageUrl}
        xPageUrl={firstVendorProfile.xPageUrl}
      />
      <pre>{JSON.stringify(vendorProfiles, null, 2)}</pre>
    </>
  );
};
