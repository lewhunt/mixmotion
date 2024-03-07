import cn from "classnames";
import React, { useRef, useCallback, useEffect } from "react";
import { useStore } from "../hooks";
import ControlButton from "./PlayerButton";
import { formatTime } from "./../utils";

import "./progress-bar.scss";

function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const isPressed = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const actions = useStore((s) => s.actions);
  const duration = useStore((s) => s.duration) || 0;
  const progress = useStore((s) => s.progress);
  const player = useStore((s) => s.player);
  const playing = useStore((s) => s.playing);

  const currentTime = progress || 0;
  const progressPercentage = (currentTime / duration) * 100;
  const skipIncrement = duration / 20;

  const handleSkipBack = useCallback(() => {
    player && progress && player.seek(progress - skipIncrement);
  }, [player, skipIncrement, progress]);

  const handleSkipForward = useCallback(() => {
    player && progress && player.seek(progress + skipIncrement);
  }, [player, skipIncrement, progress]);

  const handleMoveToPosition = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const innerDiv = barRef.current;
      if (!innerDiv) return;
      const isTouch = "touches" in event;

      const clickX = isTouch
        ? (event as React.TouchEvent).touches[0].clientX -
          innerDiv.getBoundingClientRect().left
        : (event as React.MouseEvent).nativeEvent.offsetX;

      const calculatedPercentage = clickX / innerDiv.offsetWidth;

      actions.setProgress(
        (calculatedPercentage > 1
          ? 1
          : calculatedPercentage < 0
          ? 0
          : calculatedPercentage) * duration
      );
    },
    [barRef, duration]
  );

  const handleMove = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (isPressed.current === false) return;
      event.preventDefault();
      player && player.pause();
      handleMoveToPosition(event);
    },
    [isPressed, player, handleMoveToPosition]
  );

  const handleStart = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      isPressed.current = true;
      handleMove(event);
    },
    [isPressed, handleMove]
  );

  const handleEnd = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (isPressed.current === false) return;
      isPressed.current = false;
      event.preventDefault();
      player && player.seek(currentTime);
      player && player.play();
    },
    [isPressed, player, currentTime]
  );

  const updateProgress = useCallback(async () => {
    if (player) {
      try {
        const seconds: number = await player.getPosition();
        actions.setProgress(seconds);
      } catch (error) {
        console.error("Error getting position:", error);
      }
    }
  }, [player, actions]);

  useEffect(() => {
    if (playing && !isPressed.current) {
      timerRef.current = setInterval(updateProgress, 100);
    } else {
      clearInterval(timerRef.current!);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [updateProgress, playing, isPressed]);

  return (
    <div className={cn("progress-bar")} data-testid="progress-bar">
      <span data-testid="current-time" className="time">
        {formatTime(currentTime)}
      </span>
      <span
        className="bar-wrapper"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchEnd={handleEnd}
      >
        <div className="bar" ref={barRef}>
          <ControlButton
            style={{ left: `${progressPercentage}%` }}
            className="progress-bar-button"
            focusKey="progress-bar-button"
            key="progress-bar-button"
            handleArrowPress={(dir: string) => {
              if (dir === "up" || dir === "down") return true;
              dir === "left" ? handleSkipBack() : handleSkipForward();
              return false;
            }}
          />

          <span
            className="fill"
            style={{ width: `${progressPercentage}%` }}
          ></span>
        </div>
      </span>

      <span data-testid="duration" className="time time--duration">
        {formatTime(duration)}
      </span>
    </div>
  );
}

export default ProgressBar;
