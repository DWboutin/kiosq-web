"use client";

import { Link } from "@/i18n/navigation";
import { FC, useEffect } from "react";
import { MessageBubble } from "@/components/ui/icons/message-bubble";
import { HeaderAccountButton } from "@/features/header-account-button/header-account-button";
import { useUserStore } from "@/stores/user-store";
import { ShoppingBagIcon } from "@/components/ui/icons/shopping-bag-icon";
import { useTranslations } from "next-intl";
import { LocaleDropdown } from "@/features/locale-dropdown/locale-dropdown";
import { ButtonBrand } from "@/components/ui/button-brand";

export const ConnectionHeaderUtils: FC = () => {
  const t = useTranslations("Header");
  const user = useUserStore((state) => state.user);
  const getUser = useUserStore((state) => state.getUser);

  useEffect(() => {
    getUser();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-row items-center gap-2">
        <LocaleDropdown
          className="text-neutral-dark group-hover:text-brand-medium max-sm:hidden"
          short
        />
        <Link href="/auth/sign-in" className="flex items-center gap-2 group px-2 py-3.5">
          <span className="text-base font-medium text-neutral-dark group-hover:text-brand-medium">
            {t("connectionButton")}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <HeaderAccountButton />
      <ButtonBrand variant="ghost" size="icon" aria-label={t("reservationButton")}>
        <ShoppingBagIcon className="text-neutral-dark size-6" />
      </ButtonBrand>
      <ButtonBrand
        variant="ghost"
        size="icon"
        onClick={() => {
          console.log("sign out");
        }}
        aria-label={t("signOutButton")}
      >
        <MessageBubble className="text-neutral-dark size-6" />
      </ButtonBrand>
    </div>
  );
};
