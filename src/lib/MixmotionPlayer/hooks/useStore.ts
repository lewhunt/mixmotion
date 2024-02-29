import { create } from "zustand";
import { MixmotionPlayerState } from "../types";

const INITIAL_STATE: MixmotionPlayerState = {
  activity: true,
  volume: 1,
  order: window.localStorage.getItem("order") || "popular",
  category: window.localStorage.getItem("category") || "trance",
  backdropCoverImageToggle: false,
  backdropVideoToggle:
    window.localStorage.getItem("enable_backdrop_video") === "true",
};

export const useStore = create<MixmotionPlayerState>()((set) => ({
  ...INITIAL_STATE,
  actions: {
    setActivity: (activity: boolean) => set({ activity }),
    setCategory: (category: string) => {
      set({ category });
      window.localStorage.setItem("category", category);
    },
    setBackdropVideoToggle: (backdropVideoToggle: boolean) => {
      set({ backdropVideoToggle });
      window.localStorage.setItem(
        "enable_backdrop_video",
        JSON.stringify(backdropVideoToggle)
      );
    },
    setBackdropCoverImageToggle: (backdropCoverImageToggle: boolean) =>
      set({ backdropCoverImageToggle }),
    setShowsLabel: (showsLabel: string) => set({ showsLabel }),
    setDuration: (duration: number) => set({ duration }),
    setImage: (image: string) => set({ image }),
    setShareToggle: (shareToggle: boolean) => set({ shareToggle }),
    setSaveToggle: (saveToggle: boolean) => set({ saveToggle }),
    setLoaded: (loaded: boolean) => set({ loaded }),
    setCollapsed: (collapsed: boolean) => set({ collapsed }),
    setShowIndex: (showIndex: number) => set({ showIndex }),
    setShowUnavailable: (showUnavailable: boolean) => set({ showUnavailable }),
    setShows: (shows: any[]) => set({ shows }),
    setScriptLoaded: (scriptLoaded: boolean) => set({ scriptLoaded }),
    setPlayer: (player: any) => set({ player }),
    setPlaying: (playing: boolean) => set({ playing }),
    setProgress: (progress: number) => set({ progress }),
    setSubTitle: (subTitle: string) => set({ subTitle }),
    setTitle: (title: string) => set({ title }),
    setVolume: (volume: number) => set({ volume }),
    setOrder: (order: string) => {
      set({ order });
      window.localStorage.setItem("order", order);
    },
  },
}));
