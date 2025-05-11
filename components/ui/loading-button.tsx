import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import * as React from "react";

export type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  isLoading: boolean;
};

export const LoadingButton = ({ isLoading, disabled, children, ...props }: LoadingButtonProps) => {
  return (
    <Button disabled={isLoading || disabled} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
