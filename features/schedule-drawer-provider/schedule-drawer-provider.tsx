"use client";

import { SideFormDrawerRef } from "@/components/ui/side-form-drawer";
import { useScheduleDrawer } from "@/features/schedule-drawer-provider/hooks/use-schedule-drawer";
import { AuthenticatedUserSchedule } from "@/utils/factories/authenticated-user-schedules-factory";
import { createContext, useContext, ReactNode } from "react";

type ScheduleDrawerContextValues = {
  drawerRef: React.RefObject<SideFormDrawerRef | null>;
  scheduleValues: AuthenticatedUserSchedule | null;
  handleSetScheduleValues: (values: AuthenticatedUserSchedule | null) => void;
};

const ScheduleDrawerContext = createContext({} as ScheduleDrawerContextValues);

export const useScheduleDrawerContext = () => {
  const context = useContext(ScheduleDrawerContext);

  if (context === undefined) {
    throw new Error("useScheduleDrawerContext must be used within ScheduleDrawerProvider");
  }

  return context;
};

interface ScheduleDrawerProviderProps {
  children: ReactNode;
}

export const ScheduleDrawerProvider = ({ children }: ScheduleDrawerProviderProps) => {
  const {
    selectors: { drawerRef, scheduleValues },
    actions: { handleSetScheduleValues },
  } = useScheduleDrawer();

  return (
    <ScheduleDrawerContext.Provider
      value={{
        drawerRef,
        scheduleValues,
        handleSetScheduleValues,
      }}
    >
      {children}
    </ScheduleDrawerContext.Provider>
  );
};
