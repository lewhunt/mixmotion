export function shuffle<T>(array: T[]): T[] {
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

export function formatTime(value: number) {
  if (isNaN(value)) {
    return;
  }
  let totalSeconds = value;
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = String(Math.floor(totalSeconds / 60));
  let seconds = String(Math.floor(totalSeconds % 60));
  seconds = seconds.padStart(2, "0");
  if (hours > 0) {
    minutes = minutes.padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  } else {
    return `${minutes}:${seconds}`;
  }
}

export function capitalizeWords(str: string | undefined) {
  if (!str) return;
  const words = str.split(" ");
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capitalizedWords.join(" ");
}
