import { useState, useEffect, useCallback } from "react";

export function useWindowSize() {
  const isClient = typeof document === "object";

  const getSize = useCallback(
    () => ({
      width: isClient ? document.documentElement.clientWidth : undefined,
      height: isClient ? document.documentElement.clientHeight : undefined,
    }),
    [isClient]
  );

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }
    let timeoutId = null;

    const resizeListener = () => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => setWindowSize(getSize()), 200);
    };

    window.addEventListener("resize", resizeListener);
    return () => window.removeEventListener("resize", resizeListener);
  }, [getSize, isClient]); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}
