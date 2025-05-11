import { TabsTrigger } from "@/components/ui/tabs";
import { TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { FC, useMemo } from "react";

type TabsStepNumbersProps = {
  activeTab: string;
  steps: { id: string; label: string }[];
  className?: string;
};

export type TabsStepNumbersStatus = "completed" | "active" | "inactive";

export const TabsStepNumbers: FC<TabsStepNumbersProps> = ({ activeTab, steps, className }) => {
  const stepStatuses = useMemo(() => {
    const activeIndex = steps.findIndex((step) => step.id === activeTab);

    return steps.reduce<Record<string, TabsStepNumbersStatus>>((statusMap, step, index) => {
      let status: TabsStepNumbersStatus;
      if (index < activeIndex) {
        status = "completed";
      } else if (index === activeIndex) {
        status = "active";
      } else {
        status = "inactive";
      }

      statusMap[step.id] = status;
      return statusMap;
    }, {});
  }, [activeTab, steps]);

  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-6 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-[2px] flex">
        <div
          className={cn(
            "flex-1 h-full",
            stepStatuses["basic-info"] === "completed" ? "bg-brand-light" : "bg-gray-200"
          )}
        />
        <div
          className={cn(
            "flex-1 h-full",
            stepStatuses["details"] === "completed" ? "bg-brand-light" : "bg-gray-200"
          )}
        />
        <div
          className={cn(
            "flex-1 h-full",
            stepStatuses["banner"] === "completed" ? "bg-brand-light" : "bg-gray-200"
          )}
        />
      </div>

      <TabsList className="grid w-full grid-cols-4 p-0 h-auto bg-transparent gap-0">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative">
            <TabsTrigger
              value={step.id}
              className={cn(
                "flex flex-col items-center gap-2 px-0 pt-0 pb-2 data-[state=active]:shadow-none",
                "data-[state=active]:border-none data-[state=active]:bg-transparent",
                "border-none bg-transparent hover:bg-transparent [&>div]:focus:ring-0"
              )}
            >
              <div className="z-10">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium",
                    stepStatuses[step.id] === "completed"
                      ? "bg-brand-light text-white"
                      : stepStatuses[step.id] === "active"
                      ? "bg-brand-medium text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {stepStatuses[step.id] === "completed" ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  stepStatuses[step.id] !== "completed" &&
                    stepStatuses[step.id] !== "active" &&
                    "text-neutral-medium",
                  stepStatuses[step.id] === "active" && "text-neutral-black"
                )}
              >
                {step.label}
              </span>
            </TabsTrigger>
          </div>
        ))}
      </TabsList>
    </div>
  );
};
