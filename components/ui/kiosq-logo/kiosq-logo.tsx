import { FC } from "react";

type Props = {
  inverted?: boolean;
};

export const KiosqLogo: FC<Props> = ({ inverted }) => {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="16" fill={inverted ? "#FFFFFF" : "#1A7F65"} />
      <rect
        x="9.76453"
        y="8"
        width="3.82269"
        height="15.2908"
        rx="1.91135"
        fill={inverted ? "#1A7F65" : "#FFFFFF"}
      />
      <rect
        x="19.8123"
        y="10.4847"
        width="3.82269"
        height="15.2908"
        rx="1.91135"
        transform="rotate(45 19.8123 10.4847)"
        fill={inverted ? "#1A7F65" : "#FFFFFF"}
      />
      <rect
        x="17.9833"
        y="19.4681"
        width="3.82269"
        height="3.82269"
        rx="1.91134"
        fill={inverted ? "#1A7F65" : "#FFFFFF"}
      />
    </svg>
  );
};
