"use client";

import { useUserStore } from "@/stores/user-store";
import { FC, PropsWithChildren } from "react";

export const HeaderAccountSignOut: FC<PropsWithChildren> = ({ children }) => {
  const disconnectUser = useUserStore((state) => state.disconnectUser);
  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    disconnectUser();
  };

  return (
    <button onClick={handleSignOut} aria-label="Sign out">
      {children}
    </button>
  );
};
