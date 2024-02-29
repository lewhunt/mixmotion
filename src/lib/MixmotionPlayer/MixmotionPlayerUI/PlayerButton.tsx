import cn from "classnames";
import React, { CSSProperties, useEffect } from "react";
import { useStore } from "../hooks";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

type PlayerButtonProps = {
  children?: React.ReactNode;
  handlePress?: () => void | undefined;
  handleRelease?: () => void | undefined;
  handleArrowPress?: (dir: string) => boolean;
  focusKey: string;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
};

function PlayerButton(props: PlayerButtonProps) {
  const {
    children,
    handlePress,
    handleRelease,
    handleArrowPress = () => true,
    focusKey,
    className,
    style,
    disabled,
  } = props;
  const collapsed = useStore((s) => s.collapsed);
  const activity = useStore((s) => s.activity);
  const { ref, focused, focusSelf } = useFocusable({
    onEnterPress: !disabled ? handlePress : undefined,
    onEnterRelease: !disabled ? handleRelease : undefined,
    onArrowPress: handleArrowPress,
  });
  useEffect(() => {
    focusKey === "playpause" && focusSelf();
  }, [activity, collapsed, focusSelf, focusKey]);

  return (
    <button
      style={style}
      data-testid={focusKey}
      className={cn(className, { focused, disabled })}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      focus-key={focusKey}
      ref={ref}
      onMouseEnter={focusSelf}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default PlayerButton;
