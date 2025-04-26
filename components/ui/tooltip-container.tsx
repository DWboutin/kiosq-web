import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Tooltip } from "@/components/ui/tooltip";
import { TooltipProps } from "@radix-ui/react-tooltip";
import { FC, PropsWithChildren, ReactNode } from "react";

type TooltipContainerProps = {
  content: ReactNode;
} & PropsWithChildren &
  TooltipProps;

export const TooltipContainer: FC<TooltipContainerProps> = ({ children, content, ...props }) => {
  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
