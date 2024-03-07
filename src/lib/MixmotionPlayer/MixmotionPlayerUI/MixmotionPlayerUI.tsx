import cn from "classnames";
import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  useFocusable,
  FocusContext,
} from "@noriginmedia/norigin-spatial-navigation";
import _ from "lodash";
import { use100vh } from "react-div-100vh";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeHigh,
  faVolumeMute,
  faEllipsis,
  faForwardStep,
  faBackwardStep,
  faPhotoFilm,
  faImage,
  faChevronDown,
  faChevronUp,
  faShareNodes,
  faSquareShareNodes,
  faHeart as faHeartSolid,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faMixcloud, faGithub } from "@fortawesome/free-brands-svg-icons";

import DynamicBackdrop from "../../../lib/DynamicBackdrop"; // after an npm install just import from "DynamicBackdrop"

import { useActivity, useStore, useSavedItems } from "../hooks";
import { MixmotionPlayerProps, ButtonProps } from "../types";
import { CustomLink } from "./CustomLink";
import PlayerButton from "./PlayerButton";
import ProgressBar from "./ProgressBar";

import "./mixmotion-player-ui.scss";

export const MixmotionPlayerUI: React.FC<MixmotionPlayerProps> = (props) => {
  const {
    customButtons,
    width,
    height,
    backdropVideoList,
    activityTimeout,
    showWidget,
    enableUserLink,
  } = props;
  const { focusKey, ref } = useFocusable();

  const div100vh = use100vh();

  const { updateSavedItems, isSavedItem } = useSavedItems();

  const actions = useStore((s) => s.actions);
  const activity = useStore((s) => s.activity);
  const backdropCoverImageToggle = useStore((s) => s.backdropCoverImageToggle);
  const backdropVideoToggle = useStore((s) => s.backdropVideoToggle);
  const collapsed = useStore((s) => s.collapsed);
  const image = useStore((s) => s.image);
  const player = useStore((s) => s.player);
  const playing = useStore((s) => s.playing);
  const saveToggle = useStore((s) => s.saveToggle);
  const shareToggle = useStore((s) => s.shareToggle);
  const showIndex = useStore((s) => s.showIndex) || 0;
  const showsLabel = useStore((s) => s.showsLabel);
  const showUnavailable = useStore((s) => s.showUnavailable);
  const shows = useStore((s) => s.shows) || [];
  const subTitle = useStore((s) => s.subTitle);
  const title = useStore((s) => s.title);
  const volume = useStore((s) => s.volume);

  const [startTouch, setStartTouch] = useState<{ x: number; y: number } | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const timer = useRef<any>(null);

  useActivity(activityTimeout);

  const username = shows[showIndex]?.user?.username;
  const fullShareLink =
    window.location.origin +
    window.location.pathname +
    "#" +
    shows[showIndex]?.key;

  const isPortrait =
    window.matchMedia && window.matchMedia("(orientation: portrait)").matches;

  const playerButtons: ButtonProps[] = customButtons || [
    { action: "save", align: "left" },
    { action: backdropVideoList?.length ? "videos" : "mute", align: "left" },
    { action: "previous" },
    { action: "playpause" },
    { action: "next" },
    { action: "github", align: "right" },
    { action: "collapse", align: "right" },
  ];

  const togglePlay = useCallback(() => {
    player.togglePlay();
  }, [player]);

  const toggleMuted = useCallback(() => {
    const newVolume = volume === 1 ? 0 : 1;
    actions.setVolume(newVolume);
  }, [volume]);

  const handleSave = useCallback(() => {
    updateSavedItems(shows[showIndex]);
    actions.setSaveToggle(isSavedItem(shows[showIndex]?.key));
  }, [shows, showIndex]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullShareLink);
      actions.setShareToggle(true);
    } catch (error) {
      console.error("Error copying share link:", error);
    }
    try {
      await navigator.share({
        title: document.title,
        text: `Check out this mix by ${username} - ${title}`,
        url: fullShareLink,
      });
    } catch (error) {
      console.error("Error with sharing popup:", error);
    }
  }, [fullShareLink, title, username]);

  const handlePrevious = useCallback(() => {
    if (!player || showIndex === 0) return;
    player.pause();
    timer.current = setTimeout(() => actions.setShowIndex(showIndex - 1), 200);
  }, [player, showIndex]);

  const handleNext = useCallback(() => {
    if (!player || !shows || showIndex >= shows.length - 1) return;
    player.pause();
    timer.current = setTimeout(() => {
      actions.setShowIndex(showIndex + 1);
    }, 200);
  }, [player, showIndex]);

  const handleImageToggle = useCallback(() => {
    actions.setBackdropCoverImageToggle(!backdropCoverImageToggle);
  }, [backdropCoverImageToggle]);

  const handleCollapseToggle = useCallback(() => {
    actions.setBackdropCoverImageToggle(!collapsed);
    actions.setCollapsed(!collapsed);
  }, [collapsed]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      setStartTouch({ x: touch.clientX, y: touch.clientY });
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!startTouch) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - startTouch.x;
      const deltaY = touch.clientY - startTouch.y;
      const sensitivity = 50;
      if (Math.abs(deltaX) > sensitivity || Math.abs(deltaY) > sensitivity) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (touch.clientY / window.innerHeight > 0.8) return;
          deltaX > 0 ? handlePrevious() : handleNext();
        } else {
          actions.setCollapsed(deltaY > 0);
          actions.setBackdropCoverImageToggle(deltaY > 0);
        }
        setStartTouch(null);
      }
    },
    [startTouch, handleNext, handlePrevious]
  );

  useEffect(() => {
    player?.setVolume(volume);
  }, [player, volume]);

  useEffect(() => {
    actions.setShowsLabel(showsLabel?.toLowerCase()?.replace("show", "set"));
  }, [showsLabel]);

  useEffect(() => {
    if (!shows || shows.length === 0) return;

    actions.setShareToggle(false);
    actions.setTitle(shows[showIndex].name);
    actions.setSubTitle(shows[showIndex].user.name);
    actions.setImage(
      shows[showIndex].pictures["1024wx1024h"] ||
        shows[showIndex].pictures.extra_large
    );
    actions.setSaveToggle(isSavedItem(shows[showIndex].key));
    console.log(
      "shows[showIndex].enable_cover_image, ",
      shows[showIndex].enable_cover_image
    );
    !isPortrait &&
      actions.setBackdropCoverImageToggle(shows[showIndex].enable_cover_image);

    return () => {};
  }, [shows, showIndex]);

  useEffect(() => {
    // maybe disable videos on mobile to support background audio ios control
    // isPortrait && actions.setBackdropVideoToggle(false);
  }, []);

  const buttonMap: Record<string, ButtonProps> = useMemo(() => {
    return {
      save: {
        action: "save",
        label: saveToggle ? "Saved" : "Save",
        onPress: handleSave,
        faIcon: saveToggle ? faHeartSolid : faHeart,
      },
      previous: {
        action: "previous",
        label: "Previous",
        onPress: handlePrevious,
        faIcon: faBackwardStep,
        disabled: showIndex === 0,
      },
      playpause: {
        action: "playpause",
        label: showUnavailable ? "Unavailable" : playing ? "Pause" : "Play",
        onPress: togglePlay,
        faIcon: playing ? faPause : faPlay,
        isLarge: true,
        disabled: showUnavailable,
      },
      next: {
        action: "next",
        label: "Next",
        onPress: handleNext,
        faIcon: faForwardStep,
        disabled: shows ? showIndex === shows.length - 1 : false,
      },
      mute: {
        action: "mute",
        label: volume === 0 ? "Muted" : "Mute",
        onPress: toggleMuted,
        faIcon: volume === 0 ? faVolumeMute : faVolumeHigh,
      },
      share: {
        action: "share",
        label: !shareToggle ? "Share Set" : "Link Copied!",
        onPress: handleShare,
        faIcon: !shareToggle ? faShareNodes : faSquareShareNodes,
      },
      videos: {
        action: "videos",
        label: backdropVideoToggle ? "Videos On" : "Videos Off",
        onPress: () => actions.setBackdropVideoToggle(!backdropVideoToggle),
        faIcon: backdropVideoToggle ? faPhotoFilm : faImage,
      },
      collapse: {
        action: "collapse",
        label: !collapsed ? "Collapse" : "Expand",
        onPress: handleCollapseToggle,
        faIcon: !collapsed ? faChevronDown : faChevronUp,
      },
      mixcloud: {
        action: "mixcloud",
        label: "Mixcloud Link",
        onPress: () => window.open(shows[showIndex].url, "_blank"),
        faIcon: faMixcloud,
      },
      github: {
        action: "github",
        label: "About",
        onPress: () =>
          window.open("https://github.com/lewhunt/mixmotion", "_blank"),
        faIcon: faGithub,
      },
      custom: {
        action: "custom",
        label: "Custom",
      },
    };
  }, [
    activity,
    backdropVideoToggle,
    collapsed,
    playing,
    saveToggle,
    shareToggle,
    showIndex,
    showUnavailable,
    shows,
    volume,
  ]);

  const renderButtons = (align: string) => {
    return (
      <>
        {playerButtons.map((button, index) => {
          if (!button.action) return false;
          if (button.align === align || (!button.align && align === "center")) {
            return (
              <PlayerButton
                className={cn({
                  large: button.isLarge || buttonMap[button.action].isLarge,
                  "selected-fill":
                    button.isSelectedFill ||
                    buttonMap[button.action].isSelectedFill,
                })}
                focusKey={button.action}
                handlePress={
                  button.onPress ||
                  buttonMap[button.action].onPress ||
                  undefined
                }
                handleRelease={
                  button.onRelease ||
                  buttonMap[button.action].onRelease ||
                  undefined
                }
                key={index}
                disabled={button.disabled || buttonMap[button.action].disabled}
              >
                <FontAwesomeIcon
                  icon={
                    button.faIcon ||
                    buttonMap[button.action].faIcon ||
                    faEllipsis
                  }
                />

                <small>{button.label || buttonMap[button.action].label}</small>
              </PlayerButton>
            );
          }
        })}
      </>
    );
  };

  return (
    <div
      className={cn("mixmotion-player-ui", {
        "inactive-mode": !activity,
        "collapsed-mode": collapsed,
        "fade-in": title,
      })}
      data-testid="mixmotion-player-ui"
      style={{
        width: width || "100%",
        height: height || div100vh || "100%",
      }}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <DynamicBackdrop
        imageSrc={image || ""}
        enableVideo={!activity && backdropVideoToggle}
        enableCoverImage={backdropCoverImageToggle}
        disableBlurAnimation={false}
        disablePulseAnimation={false}
        disableSlideAnimation={false}
        videoList={backdropVideoList}
        handleCrossOriginVideo={() => actions.setBackdropVideoToggle(false)}
      />

      <div className={cn("mixmotion-player-ui__cover")} />

      <img
        className="mixmotion-player-ui__image"
        src={image}
        onClick={handleImageToggle}
      />

      <div
        className={cn("mixmotion-player-ui__content", {
          "fade-out": !activity && playing,
        })}
      >
        <div className="metadata-wrapper">
          <div className="metadata metadata--title">{title}</div>

          {!collapsed && username && (
            <FocusContext.Provider value={focusKey}>
              <div className="metadata metadata--subTitle">
                {enableUserLink ? (
                  <CustomLink to={`/${username}`}>
                    {subTitle && _.truncate(subTitle, { length: 30 })}
                  </CustomLink>
                ) : (
                  <div className="custom-link">
                    {subTitle && _.truncate(subTitle, { length: 30 })}
                  </div>
                )}
              </div>
            </FocusContext.Provider>
          )}

          {shows.length > 1 && (
            <div className="metadata metadata--count">
              {showIndex + 1} of {shows.length} <span>{showsLabel}</span>
            </div>
          )}
        </div>

        <FocusContext.Provider value={focusKey}>
          <div className="buttons" ref={ref}>
            <div className="buttons__center">{renderButtons("center")}</div>

            <div className="buttons__left-right">
              <div className="buttons__left">{renderButtons("left")}</div>

              <div className="buttons__right">{renderButtons("right")}</div>
            </div>
          </div>
        </FocusContext.Provider>

        <div className="progress-bar-wrapper">
          {activity && !collapsed && !showWidget && <ProgressBar />}
        </div>
      </div>
    </div>
  );
};
