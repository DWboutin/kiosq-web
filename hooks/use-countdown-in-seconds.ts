import { useEffect } from "react";

import { useState } from "react";

export const useCountdownInSeconds = (initialCountdown: number) => {
  const [countdown, setCountdown] = useState(initialCountdown);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  return { countdown, setCountdown };
};
