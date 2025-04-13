import { FC } from "react";

type DashboardPageHeadingProps = {
  title: string;
  description: string;
  cta: React.ReactNode;
};

export const DashboardPageHeading: FC<DashboardPageHeadingProps> = ({
  title,
  description,
  cta,
}) => {
  return (
    <div className="flex flex-row justify-between items-start gap-4 pt-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-inter font-semibold text-neutral-black">{title}</h1>
        <p className="text-sm font-inter text-neutral-darker">{description}</p>
      </div>
      <div className="flex flex-row gap-2">{cta}</div>
    </div>
  );
};
