import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { CSSProperties } from "react";

type ButtonAction =
  | "custom"
  | "collapse"
  | "github"
  | "mixcloud"
  | "mute"
  | "next"
  | "playpause"
  | "previous"
  | "save"
  | "share"
  | "videos";

type ButtonAlign = "left" | "center" | "right";

export type ButtonProps = {
  action?: ButtonAction;
  align?: ButtonAlign;
  disabled?: boolean;
  faIcon?: IconDefinition;
  isSelectedFill?: boolean;
  isLarge?: boolean;
  label?: string;
  onPress?: () => void;
  onRelease?: () => void;
};

export type ShowsDataType = {
  label?: string;
  shows?: ShowItemType[];
};

export type ShowItemType = {
  url: string;
  key: string;
  name: string;
  enable_cover_image?: boolean;
  pictures: {
    extra_large: string;
    "1024wx1024h": string;
    [key: string]: any;
  };
  user: {
    url: string;
    name: string;
    username: string;
    [key: string]: any;
  };
  [key: string]: any;
};

export type MixmotionPlayerProps = {
  autoPlay?: boolean;
  activityTimeout?: number;
  backdropVideoList?: string[];
  collapsed?: boolean;
  children?: React.ReactNode;
  customButtons?: ButtonProps[];
  enableBackdropVideo?: boolean;
  enableUserLink?: boolean;
  height?: string;
  listIndex?: number;
  showWidget?: boolean;
  showsData?: ShowsDataType;
  style?: CSSProperties;
  url?: string;
  withExclusives?: boolean;
  width?: string;
  onBuffering?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onReady?: (player: any) => void;
};

export type MixmotionPlayerState = {
  activity?: boolean;
  actions?: any;
  backdropVideoToggle?: boolean;
  backdropCoverImageToggle?: boolean;
  category?: string;
  duration?: number;
  image?: string;
  loaded?: boolean;
  collapsed?: boolean;
  order?: string;
  player?: any;
  playing?: boolean;
  progress?: number;
  saveToggle?: boolean;
  shareToggle?: boolean;
  showIndex?: number;
  showsLabel?: string;
  shows?: ShowItemType[];
  showUnavailable?: boolean;
  scriptLoaded?: boolean;
  subTitle?: string | null;
  title?: string | null;
  volume?: number;
};
