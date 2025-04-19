"use client";

import { UserCircleIcon } from "@/components/ui/icons/user-circle-icon";
import { Link } from "@/i18n/navigation";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/ui/icons/message-bubble";
import { HeaderAccountButton } from "@/features/header-account-button/header-account-button";
import { useUserStore } from "@/stores/user-store";
import { ShoppingBagIcon } from "@/components/ui/icons/shopping-bag-icon";

export const ConnectionHeaderUtils: FC = () => {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return (
      <Link href="/auth/sign-in" className="flex items-center gap-2 group px-2 py-3.5">
        <UserCircleIcon className="w-6 h-6 text-neutral-dark group-hover:text-brand-medium" />
        <span className="text-base font-medium text-neutral-dark group-hover:text-brand-medium">
          Connexion
        </span>
      </Link>
    );
  }

  return (
    <div className="flex items-center px-2 py-2">
      <HeaderAccountButton />
      <Button variant="ghost" size="icon" aria-label="Réservations">
        <ShoppingBagIcon className="text-neutral-dark size-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          console.log("sign out");
        }}
        aria-label="Sign out"
      >
        <MessageBubble className="text-neutral-dark size-6" />
      </Button>
    </div>
  );
};
