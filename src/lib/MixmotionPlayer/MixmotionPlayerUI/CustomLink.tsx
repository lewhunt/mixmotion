import cn from "classnames";
import React, { useEffect } from "react";
import {
  Link,
  useMatch,
  useResolvedPath,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useStore } from "../hooks";

import "./mixmotion-player-ui.scss";

type CustomLinkProps = {
  to: string;
  children: React.ReactNode;
  focusKey?: string;
  handlePress?: () => void | undefined;
  handleRelease?: () => void | undefined;
  disabled?: boolean;
  overrideFocus?: boolean;
  className?: string;
};

export const CustomLink: React.FC<CustomLinkProps> = ({
  children,
  to,
  focusKey,
  handlePress,
  handleRelease,
  disabled,
  overrideFocus,
  className,
  ...props
}) => {
  try {
    useLocation?.();
  } catch (e) {
    return <div className="custom-link no-routes-fallback">{children}</div>;
  }
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });
  const location = useLocation();
  const navigate = useNavigate();
  const category = useStore((s) => s.category);
  const { ref, focused, focusSelf } = useFocusable({
    onEnterPress: () => {
      !disabled && handlePress?.();
      !disabled && to && navigate(to);
    },
    onEnterRelease: () => {
      !disabled && handleRelease?.();
    },
    forceFocus: true,
  });

  useEffect(() => {
    focusKey === category && focusSelf();
    overrideFocus && focusSelf();
  }, [focusSelf, focusKey, overrideFocus]);

  return (
    <Link
      className={cn(className, "custom-link", {
        match: match && location.search === resolved.search,
        focused,
        disabled,
      })}
      to={to}
      {...props}
      focus-key={focusKey || to}
      ref={ref}
      onMouseEnter={focusSelf}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
    >
      {children}
    </Link>
  );
};
