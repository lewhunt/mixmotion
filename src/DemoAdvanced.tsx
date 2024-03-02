import { useEffect, useMemo, useState } from "react";
import {
  MixmotionPlayer,
  useSavedItems,
  ShowsDataType,
  ButtonProps,
} from "./lib/MixmotionPlayer"; // consuming apps can just import from "mixmotion-player"

const customButtons: ButtonProps[] = [
  { action: "save", align: "left" },
  { action: "videos", align: "left" },
  { action: "previous", align: "center" },
  { action: "playpause", align: "center" },
  { action: "next", align: "center" },
  { action: "github", align: "right" },
  { action: "collapse", align: "right" },
];

const backdropVideoList = [
  "./sample-backdrops/blue-smoke-form-waves.mp4",
  "./sample-backdrops/heat-light-star-fractal-space.mp4",
  "./sample-backdrops/stars-night-space-light.mp4",
  "./sample-backdrops/star-stars-confetti-light-night.mp4",
  "./sample-backdrops/lightning-light-design-star.mp4",
  "./sample-backdrops/circuit-camera-movement.mp4",
  "./sample-backdrops/glowing-spheres-particles.mp4",
  "./sample-backdrops/star-space-color-dodge.mp4",
];

function Demo() {
  const { getSavedItems } = useSavedItems();

  const [url, setUrl] = useState("");
  const [enableSavedData, setEnableSavedData] = useState<boolean>();

  useEffect(() => {
    setUrl("https://www.mixcloud.com/discover/trance/?order=latest");
    setEnableSavedData(false); // set true to access saved data
  }, []);

  const getSavedData = useMemo(() => {
    if (!enableSavedData) return;
    const savedItems = getSavedItems();
    if (savedItems.length)
      return {
        label: "Saved Sets",
        shows: savedItems.reverse(),
      } as ShowsDataType;
  }, [enableSavedData, getSavedItems]);

  return (
    <MixmotionPlayer
      url={url}
      showsData={getSavedData}
      customButtons={customButtons}
      backdropVideoList={backdropVideoList}
      enableBackdropVideo={true}
    />
  );
}

export default Demo;
