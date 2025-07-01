import { FC } from "react";
import classNames from "classnames";

type DashboardPageHeadingProps = {
  title: string;
  description: string;
  cta?: React.ReactNode;
  headingLevel?: "h1" | "h2";
};

export const DashboardPageHeading: FC<DashboardPageHeadingProps> = ({
  title,
  description,
  cta,
  headingLevel = "h1",
}) => {
  const Heading = headingLevel === "h1" ? "h1" : "h2";

  return (
    <div className="flex flex-row max-md:flex-col-reverse justify-between items-start gap-4 pt-8">
      <div className="flex flex-col gap-2">
        <Heading
          className={classNames(
            "font-inter font-semibold text-neutral-black",
            headingLevel === "h1" ? "text-2xl" : "text-xl"
          )}
        >
          {title}
        </Heading>
        <p className="text-sm font-inter text-neutral-darker">{description}</p>
      </div>
      {cta && <div className="flex flex-row gap-2 ml-auto max-md:ml-0 max-md:self-end">{cta}</div>}
    </div>
  );
};
