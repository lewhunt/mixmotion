import cn from "classnames";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { use100vh } from "react-div-100vh";
import { useWindowVisibility } from "./hooks";

import "./dynamic-backdrop.scss";

type DynamicBackdropProps = {
  imageSrc: string;
  enableVideo?: boolean;
  enableCoverImage?: boolean;
  enableCrossOriginVideo?: boolean;
  disableBlurAnimation?: boolean;
  disablePulseAnimation?: boolean;
  disableSlideAnimation?: boolean;
  videoList?: string[];
  handleCrossOriginVideo?: () => void;
};

function getRandomItem<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const DynamicBackdrop: React.FC<DynamicBackdropProps> = ({
  imageSrc,
  enableVideo = false,
  enableCoverImage = false,
  enableCrossOriginVideo = true,
  disableBlurAnimation = false,
  disablePulseAnimation = false,
  disableSlideAnimation = false,
  videoList = [],
  handleCrossOriginVideo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoRefPreloader = useRef<HTMLVideoElement | null>(null);
  const timer = useRef<any>(null);

  const div100vh = use100vh();

  const [videoCounter, setVideoCounter] = useState<number>(1);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [videoBlend, setVideoBlend] = useState("");
  const [videoVisible, setVideoVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(1);

  const windowVisibility = useWindowVisibility();

  const isPortrait =
    window.matchMedia && window.matchMedia("(orientation: portrait)").matches;

  const videoBlends: string[] = [
    "luminosity",
    "soft-light",
    "overlay",
    "screen",
    "multiply",
    "hard-light",
    "normal",
    "color-dodge",
  ];

  let animationFrameId;

  const shuffledVideoList = useMemo(() => {
    if (!videoList) return;
    const shuffledArray = shuffle(videoList?.slice() as string[]);
    shuffledArray.push(shuffledArray[0]);
    return shuffledArray;
  }, [videoList, imageSrc]);

  const handleCanPlay = useCallback(() => {
    if (videoCounter <= 1) return;
    //if (Math.random() < 0.3 && videoCounter > 2) return;
    setVideoVisible(true);
    videoRef.current!.play();
  }, [videoCounter]);

  const loadVideo = useCallback(() => {
    if (!shuffledVideoList) return;
    setVideoVisible(false);
    videoRefPreloader.current!.src = `${shuffledVideoList[videoCounter - 1]}`;
    if (videoCounter <= 1) return;
    clearTimeout(timer.current!);
    timer.current = setTimeout(() => {
      setVideoSrc(`${shuffledVideoList[videoCounter - 2]}`);
    }, 500);
  }, [videoCounter, shuffledVideoList]);

  useEffect(() => {
    if (!videoVisible) {
      const foundBlend = videoBlends.find((blend) => videoSrc.includes(blend));
      setVideoBlend(foundBlend || getRandomItem(videoBlends));
    }
  }, [videoVisible, videoSrc]);

  useEffect(() => {
    //console.log(videoBlend);
  }, [videoBlend]);

  useEffect(() => {
    const videoSrc = shuffledVideoList?.[videoCounter - 1];
    if (
      videoSrc?.startsWith("http") &&
      !videoSrc?.startsWith(window.location.origin) &&
      !enableCrossOriginVideo
    ) {
      console.warn("Cross-origin playback is disabled to conserve bandwidth.");
      handleCrossOriginVideo?.();
      return;
    }
    if (!enableVideo || !shuffledVideoList || !windowVisibility) return;

    loadVideo();

    const timer = setTimeout(() => {
      const counter = videoCounter;
      setVideoCounter(counter === shuffledVideoList?.length ? 1 : counter + 1);
      const randomVideoDuration =
        Math.floor(Math.random() * (15 - 11 + 1)) + 11;
      setVideoDuration(randomVideoDuration);
    }, videoDuration * 1000);

    return () => clearTimeout(timer);
  }, [videoCounter, videoDuration, enableVideo, windowVisibility]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.src = imageSrc;

    let startTime: number;
    let loopScaleFactor: boolean;

    const rotationDirection = Math.random() < 0.5 ? -1 : 1;

    const minDuration = 20000;
    const maxDuration = 30000;

    const duration =
      Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;

    setVideoVisible(false);
    setVideoSrc("");
    setVideoCounter(1);
    setVideoDuration(3);

    let overlayPosX = 0;
    let overlayRotation = 1;

    const animate = (timestamp: number = 0) => {
      if (!startTime) {
        startTime = timestamp;
      }

      let progress = (timestamp - startTime) / duration;
      let scaleFactor = ((progress * 1.5) % 5) + (isPortrait ? 0.4 : 0.2);

      if (scaleFactor > 3) {
        scaleFactor = 6 - scaleFactor;
        loopScaleFactor = true;
      }
      if (scaleFactor < 1 && loopScaleFactor) {
        scaleFactor = 1;
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.globalAlpha = 0.95;

      context.save();
      const opacityFactor = Math.sin(progress * 4 * Math.PI);

      context.globalAlpha = Math.abs(lerp(0.8, 0.99, opacityFactor));
      context.translate(centerX, centerY);
      context.scale(scaleFactor, scaleFactor);
      context.rotate((rotationDirection * 360 * progress * Math.PI) / 180);
      context.drawImage(image, -centerX, -centerY, canvas.width, canvas.height);
      context.restore();

      if (!disablePulseAnimation) {
        if (scaleFactor <= 1) {
          overlayPosX = Math.random() < 0.5 ? 0 : canvas.width;
          overlayRotation = Math.random() < 0.5 ? -1 : 1;
        } else {
          context.save();
          context.translate(overlayPosX, 0);
          context.scale(0.25 * scaleFactor, 0.25 * scaleFactor);
          context.rotate(
            (overlayRotation * 360 * progress * 4 * Math.PI) / 180
          );
          const opacityPulseFactor = Math.cos(progress * 30 * Math.PI);
          context.globalCompositeOperation = "lighter";
          context.globalAlpha = Math.abs(opacityPulseFactor);
          context.drawImage(
            image,
            centerX,
            centerY,
            canvas.width,
            canvas.height
          );
          context.restore();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    setImageLoaded(false);

    image.onload = () => {
      setImageLoaded(true);
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const blurValue = 75;

      if (context.filter !== undefined) {
        context.filter = `blur(${blurValue}px)`;
      } else {
        canvas.style.filter = `blur(${blurValue}px)`;
      }

      if (disableBlurAnimation || !windowVisibility) {
        context.globalAlpha = 0.5;
        context.drawImage(image, 0, 0);
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    return () => {
      cancelAnimationFrame(animationFrameId!);
      clearTimeout(timer.current!);
    };
  }, [imageSrc, disableBlurAnimation, disablePulseAnimation, windowVisibility]);

  useEffect(() => {
    if (!imageSrc || !enableCoverImage) return;
    const appSize = () => {
      const doc = document.documentElement;
      doc.style.setProperty("--app-height", `${div100vh}px`);
    };
    window.addEventListener("resize", appSize);
    appSize();
    return () => window.removeEventListener("resize", appSize);
  }, [imageSrc, enableCoverImage, div100vh]);

  const lerp = (start: number, end: number, t: number) => {
    return start * (1 - t) + end * t;
  };

  if (!windowVisibility) return;

  return (
    <div className="dynamic-backdrop" data-testid="dynamic-backdrop">
      {enableVideo && (
        <video
          ref={videoRefPreloader}
          key={videoCounter}
          style={{ opacity: 0 }}
          muted
        >
          <source src="" type="video/mp4" />
        </video>
      )}
      <canvas
        key={imageSrc}
        ref={canvasRef}
        className="dynamic-backdrop__canvas"
      />
      <img
        className={cn("dynamic-backdrop__cover-image", {
          static: disableSlideAnimation,
          enable: enableCoverImage && imageLoaded,
          "with-video": enableVideo,
          "with-video-visible": enableVideo && videoVisible,
        })}
        src={imageSrc}
      />

      {enableVideo && (
        <video
          ref={videoRef}
          key={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={handleCanPlay}
          style={{
            mixBlendMode: videoBlend as React.CSSProperties["mixBlendMode"],
          }}
          className={cn("dynamic-backdrop__video", {
            visible: videoVisible,
          })}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

export default DynamicBackdrop;
