"use client";

import { VendorStoreHeader } from "@/components/sections/vendor-store-header";
import { CreateProfileWizard } from "@/features/create-profile-wizard/create-profile-wizard";
import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { Profile } from "@/utils/factories/profiles-factory";
import { FC } from "react";

type DashboardYourStoreProps = {
  profilesData: Profile[];
};

export const DashboardYourStore: FC<DashboardYourStoreProps> = ({ profilesData }) => {
  const {
    selectors: { profiles, isLoading, error },
  } = useCurrentUserProfiles({ profilesData });
  const vendorProfiles = profiles.filter((profile) => profile.type === "vendor");

  console.log(profiles);

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
    </>
  );
};
