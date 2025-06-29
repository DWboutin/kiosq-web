import { SideFormDrawerRef } from "@/components/ui/side-form-drawer";
import { AuthenticatedUserSchedule } from "@/utils/factories/authenticated-user-schedules-factory";
import { useRef, useState } from "react";

export const useScheduleDrawer = () => {
  const drawerRef = useRef<SideFormDrawerRef>(null);
  const [scheduleValues, setScheduleValues] = useState<AuthenticatedUserSchedule | null>(null);

  const handleSetScheduleValues = (values: AuthenticatedUserSchedule | null) => {
    setScheduleValues(values);
  };

  return {
    selectors: {
      drawerRef,
      scheduleValues,
    },
    actions: {
      handleSetScheduleValues,
    },
  };
};
