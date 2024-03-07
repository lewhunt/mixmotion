import cn from "classnames";
import React, { useRef, useEffect, useCallback } from "react";
import { init } from "@noriginmedia/norigin-spatial-navigation";
import { use100vh } from "react-div-100vh";
import { MixmotionPlayerUI } from "./MixmotionPlayerUI";
import { MixmotionPlayerProps } from "./types";
import { useStore } from "./hooks";
import { fetchShows } from "./services";

import "./mixmotion-player.scss";

export const MixmotionPlayer: React.FC<MixmotionPlayerProps> = (props) => {
  const {
    autoPlay = true,
    url,
    showsData,
    listIndex = 0,
    withExclusives = false,
    width,
    height,
    showWidget,
    style,
    children,
    onReady,
    onPlay,
    onPause,
    onBuffering,
    onEnded,
    onError,
  } = props;

  init({
    debug: false,
    visualDebug: false,
    throttle: 100,
    // options
  });

  const actions = useStore((s) => s.actions);
  const activity = useStore((s) => s.activity);
  const collapsed = useStore((s) => s.collapsed);
  const loaded = useStore((s) => s.loaded);
  const shows = useStore((s) => s.shows) || [];
  const showIndex = useStore((s) => s.showIndex) || 0;
  const scriptLoaded = useStore((s) => s.scriptLoaded);
  const showUnavailable = useStore((s) => s.showUnavailable);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timer = useRef<any>(null);
  const div100vh = use100vh();

  const incrementShowIndex = useCallback(() => {
    showIndex !== null &&
      showIndex < shows.length - 1 &&
      actions.setShowIndex(showIndex + 1);
  }, [showIndex, shows]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://widget.mixcloud.com/media/js/widgetApi.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => actions.setScriptLoaded(true);
  }, []);

  useEffect(() => {
    if (!url && !showsData) {
      actions.setLoaded(true);
      return;
    }

    actions.setLoaded(false);

    function updateShows(data: any) {
      const shows = data?.shows;
      if (!shows) {
        actions.setLoaded(true);
        return;
      }
      actions.setShowsLabel(data?.label || "Shows");
      actions.setShows(shows);
      actions.setShowIndex(shows && shows?.length > listIndex ? listIndex : 0);
    }

    if (Array.isArray(showsData?.shows)) {
      updateShows(showsData);
      actions.setLoaded(true);
    } else if (url) {
      fetchShows({ cloudcastKeyUrl: url, withExclusives })
        .then((data: any) => {
          updateShows(data);
        })
        .catch(() => actions.setLoaded(true));
    } else actions.setLoaded(true);
  }, [url, showsData, withExclusives, listIndex]);

  useEffect(() => {
    if (!shows || shows.length === 0) return;

    if (iframeRef.current && scriptLoaded) {
      const widget = (window as any).Mixcloud.PlayerWidget(iframeRef.current);

      actions.setPlayer(null);
      actions.setLoaded(false);
      actions.setShowUnavailable(false);
      actions.setProgress(0);

      widget.ready.then(() => {
        actions.setPlayer(widget);
        widget.pause();
        onReady?.(widget);

        widget.events.pause.on(() => {
          actions.setPlaying(false);
          actions.setLoaded(true);
          onPause?.();
        });

        widget.events.play.on(() => {
          actions.setPlaying(true);
          actions.setLoaded(true);
          timer.current = setTimeout(() => actions.setLoaded(true), 1000);
          onPlay?.();
        });

        widget.events.ended.on(() => {
          incrementShowIndex();
          onEnded?.();
        });

        widget.events.buffering.on(() => {
          actions.setLoaded(false);
          onBuffering?.();
        });

        widget.events.error.on((error: any) => {
          actions.setShowUnavailable(true);
          actions.setPlaying(false);
          onError?.(error);
        });

        widget.getDuration().then(function (duration: number) {
          actions.setLoaded(false);
          if (!duration) {
            console.error("licence issue");
            actions.setShowUnavailable(true);
            actions.setPlaying(false);
            return;
          }
          actions.setLoaded(true);
          actions.setDuration(duration);
          actions.setShowUnavailable(false);
          !props.collapsed && actions.setCollapsed(false);
          timer.current = setTimeout(
            () => autoPlay === true && widget.play(),
            200
          );
        });
      });
      return () => {
        timer.current && clearTimeout(timer.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shows, showIndex, scriptLoaded]);

  useEffect(() => {
    !window.localStorage.getItem("enable_backdrop_video") &&
      actions.setBackdropVideoToggle(!!props.enableBackdropVideo);
  }, [props.enableBackdropVideo]);

  useEffect(() => {
    actions.setCollapsed(props.collapsed);
  }, [props.collapsed]);

  return (
    <div
      className="mixmotion-player"
      data-testid="mixmotion-player"
      style={{
        width: width || "100%",
        height: height || div100vh || "100%",
        ...style,
      }}
    >
      {shows.length > 0 && (
        <>
          <iframe
            title="mixcloud-widget"
            ref={iframeRef}
            key={shows[showIndex]?.key}
            className={cn("mixcloud-widget", {
              show: showWidget && !collapsed && activity,
            })}
            width="100%"
            height="60"
            allow="autoplay"
            src={`https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&autoplay=${autoPlay}&feed=${encodeURIComponent(
              shows[showIndex]?.url
            )}`}
            frameBorder="0"
          />

          {<MixmotionPlayerUI {...props} />}

          {children}
        </>
      )}
      {!loaded && !showUnavailable && <MixmotionSpinner />}
    </div>
  );
};

const MixmotionSpinner: React.FC = () => {
  return (
    <svg className={cn("mixmotion-player__spinner")} viewBox="0 0 24 24">
      <path
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        opacity=".25"
      />
      <path
        d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
        className="path"
      />
    </svg>
  );
};
