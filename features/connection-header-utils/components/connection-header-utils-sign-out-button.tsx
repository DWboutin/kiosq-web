"use client";

import { useUserStore } from "@/stores/user-store";
import { Button } from "@/components/ui/button";
import { SignOutIcon } from "@/components/ui/icons/sign-out-icon";

export const ConnectionHeaderUtilsSignOutButton = () => {
  const disconnectUser = useUserStore((state) => state.disconnectUser);

  return (
    <Button variant="ghost" size="icon" onClick={disconnectUser} aria-label="Sign out">
      <SignOutIcon className="text-neutral-medium size-6" />
    </Button>
  );
};
