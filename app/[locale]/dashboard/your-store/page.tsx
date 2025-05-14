import { getUserVendorProfiles } from "@/actions/get-user-vendor-profiles";
import { CreateProfileWizard } from "@/features/create-profile-wizard/create-profile-wizard";

export default async function YourStorePage() {
  const profiles = await getUserVendorProfiles();

  return (
    <>
      <div className="flex flex-col flex-1">your store</div>
      <CreateProfileWizard />
      <pre>{JSON.stringify(profiles, null, 2)}</pre>
    </>
  );
}
