import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContentProps, TooltipProps } from "@radix-ui/react-tooltip";
import { FC, PropsWithChildren, ReactNode } from "react";

type TooltipContainerProps = {
  content: ReactNode;
  contentProps?: TooltipContentProps;
} & PropsWithChildren &
  TooltipProps;

export const TooltipContainer: FC<TooltipContainerProps> = ({
  children,
  content,
  contentProps,
  ...props
}) => {
  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent {...contentProps}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
