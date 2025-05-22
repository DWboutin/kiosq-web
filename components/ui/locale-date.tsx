import { TooltipContainer } from "@/components/ui/tooltip-container";
import { useFormatter } from "next-intl";
import { FC, memo } from "react";

type LocaleDateProps = {
  date: string;
};

export const LocaleFullDate: FC<LocaleDateProps> = memo(({ date }) => {
  const format = useFormatter();
  const dateTime = new Date(date);

  return (
    <TooltipContainer content={dateTime.toLocaleString()} disableHoverableContent>
      <span>
        {format.dateTime(dateTime, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}
      </span>
    </TooltipContainer>
  );
});

LocaleFullDate.displayName = "LocaleFullDate";
