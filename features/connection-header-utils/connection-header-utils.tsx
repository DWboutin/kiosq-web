"use client";

import { UserCircleIcon } from "@/components/ui/icons/user-circle-icon";
import Link from "next/link";
import { ConnectionHeaderUtilsSignOutButton } from "./components/connection-header-utils-sign-out-button";
import { FC } from "react";
import { useUserStore } from "@/stores/user-store";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/ui/icons/message-bubble";

export const ConnectionHeaderUtils: FC = () => {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return (
      <Link href="/auth/sign-in" className="flex items-center gap-2 group px-2 py-2">
        <UserCircleIcon className="w-6 h-6 text-neutral-darker group-hover:text-brand-medium" />
        <span className="text-base font-medium text-neutral-darker group-hover:text-brand-medium">
          Connexion
        </span>
      </Link>
    );
  }

  return (
    <div className="flex items-center px-2 py-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          console.log("sign out");
        }}
        aria-label="Sign out"
      >
        <UserCircleIcon className="text-neutral-medium size-6" />
      </Button>
      <ConnectionHeaderUtilsSignOutButton />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          console.log("sign out");
        }}
        aria-label="Sign out"
      >
        <MessageBubble className="text-neutral-medium size-6" />
      </Button>
    </div>
  );
};
