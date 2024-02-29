import { useEffect, useCallback, useRef } from "react";
import { useStore } from "./useStore.ts";

const ACTIVITY_TIMEOUT = 4000;

export const useActivity = (activityTimeout: number = ACTIVITY_TIMEOUT) => {
  const timer = useRef<any>(null);
  const actions = useStore((s) => s.actions);
  const activity = useStore((s) => s.activity);
  const playing = useStore((s) => s.playing);

  const startActivityTimer = useCallback(
    (activity: boolean | undefined) => {
      timer.current && clearTimeout(timer.current);

      if (!activity || !playing) return;

      timer.current = window.setTimeout(() => {
        actions.setActivity(false);
      }, activityTimeout);
    },
    [actions, playing, activityTimeout]
  );

  const activate = useCallback(
    (e: MouseEvent | KeyboardEvent) => {
      actions.setActivity(true);
      startActivityTimer(activity);
      !activity && e.stopPropagation();
    },
    [activity, actions, startActivityTimer]
  );

  const deActivate = useCallback(() => {
    playing && activity && actions.setActivity(false);
  }, [playing, activity, actions]);

  useEffect(() => {
    startActivityTimer(activity);
  }, [activity, startActivityTimer]);

  useEffect(() => {
    document.addEventListener("click", activate);
    document.addEventListener("mousemove", activate);
    document.addEventListener("keydown", activate);
    document.addEventListener("mouseleave", deActivate);
    return () => {
      document.removeEventListener("click", activate);
      document.removeEventListener("mousemove", activate);
      document.removeEventListener("keydown", activate);
      document.removeEventListener("mouseleave", deActivate);
    };
  }, [activate, deActivate]);
};
