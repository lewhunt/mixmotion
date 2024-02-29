import { useEffect, useState } from "react";

export const useWindowVisibility = () => {
  const [visibility, setVisibility] = useState(
    document.visibilityState === "visible"
  );
  useEffect(() => {
    const onVisibilityChange = () =>
      setVisibility(document.visibilityState === "visible");
    window.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
  return visibility;
};
