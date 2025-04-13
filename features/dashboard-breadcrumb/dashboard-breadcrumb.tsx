import { CaretRightIcon } from "@/components/ui/icons/caret-right-icon";
import { DashboardIcon } from "@/components/ui/icons/dashboard-icon";
import { FC } from "react";

export const DashboardBreadcrumb: FC = () => {
  return (
    <div className="flex flex-row justify-start items-start w-full gap-2 py-5 px-5">
      <div className="flex flex-row items-center gap-2">
        <span className="text-xl font-inter font-semibold text-neutral-dark">
          Système de gestion
        </span>
        <CaretRightIcon className="w-4 h-4" />
        <div className="flex flex-row items-center gap-2 text-brand-medium">
          <DashboardIcon className="w-6 h-6" />
          <span className="text-xl font-inter font-semibold">Tableau de bord</span>
        </div>
      </div>
    </div>
  );
};
