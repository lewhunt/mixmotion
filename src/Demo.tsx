import { useEffect, useState } from "react";
import { MixmotionPlayer } from "./lib/MixmotionPlayer"; // consuming apps can just import from "mixmotion-player"

function Demo() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl("https://www.mixcloud.com/discover/trance/?order=latest");
  }, []);

  return <MixmotionPlayer url={url} />;
}

export default Demo;
