"use client";

import { useUserStore } from "@/stores/user-store";
import { FC, PropsWithChildren } from "react";

export const HeaderAccountSignOut: FC<PropsWithChildren> = ({ children }) => {
  const disconnectUser = useUserStore((state) => state.disconnectUser);

  const handleSignOut = () => {
    disconnectUser();
  };

  return <div onClick={handleSignOut}>{children}</div>;
};
