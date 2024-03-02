import { shuffle } from "./utils";

const processCloudcastKeyUrl = (
  cloudcastKeyUrl: string
): { modifiedKey: string; orderValue: string } => {
  if (!cloudcastKeyUrl) return { modifiedKey: "", orderValue: "" };
  let modifiedKey =
    cloudcastKeyUrl.charAt(0) === "/"
      ? cloudcastKeyUrl.substring(1)
      : cloudcastKeyUrl;

  if (!cloudcastKeyUrl.includes("mixcloud.com")) {
    modifiedKey = "https://www.mixcloud.com/" + modifiedKey;
  }

  const urlObject = new URL(modifiedKey);
  const orderValue = urlObject.searchParams.get("order") || "popular";
  urlObject.searchParams.delete("order");
  urlObject.searchParams.delete("index");
  modifiedKey = urlObject.toString().replace("https://www.mixcloud.com", "");

  return { modifiedKey, orderValue };
};

const retryFetch = async (url: string) => {
  const maxAttempts = 3;
  let delayBetweenRetries = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.log(
          `Attempt ${attempt} failed with status ${response.status}. Retrying...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenRetries)
        );
        delayBetweenRetries *= 2;
        continue;
      }

      return response.json();
    } catch (error) {
      console.error(`Error on attempt ${attempt}:`, error);
      await new Promise((resolve) => setTimeout(resolve, delayBetweenRetries));
      if (attempt === maxAttempts) {
        throw error;
      }
    }
  }
};

const unplayableKeys = [
  "/ministryofsound/ministry-of-sound-boxed-mike-williams/",
  "/goodkids/heavy-metal-mixtape-vol-1/",
  "/sinlopez/linkin-park-2012-06-05-admiralspalast-berlin-germany/",
  "/djrusske/djrusske-30minutesof-chrisbrown-part-2promotional-use-only/",
];

const keysWithCoverImage = [
  "/ministryofsound/the-chillout-sessions-ibiza-2002-mix-2-ministry-of-sound/",
  "/ministryofsound/rebūke-x-playground-live-mix-ministry-of-sound/",
  "/ministryofsound/ibiza-end-of-season-mini-mix-2022-ministry-of-sound/",
  "/ministryofsound/workforce-x-drum-bass-sessions-mix-ministry-of-sound/",
  "/oNlineRXD/",
];

export const fetchShows = async ({
  cloudcastKeyUrl,
  limit = 100,
  withExclusives = false,
}: {
  cloudcastKeyUrl: string;
  limit?: number;
  withExclusives?: boolean;
}) => {
  if (!cloudcastKeyUrl) return [];

  const { modifiedKey, orderValue } = processCloudcastKeyUrl(cloudcastKeyUrl);

  const getFilteredShows = (data: any[]) =>
    data?.filter((show) => {
      const isUnwantedKey = unplayableKeys.includes(show.key);
      const passesExclusivity = withExclusives ? true : !show.is_exclusive;
      const shouldEnableCoverImage =
        keysWithCoverImage.includes(show.key) ||
        keysWithCoverImage.includes(show.user.key);
      if (shouldEnableCoverImage) show.enable_cover_image = true;
      return !isUnwantedKey && passesExclusivity;
    });

  if (modifiedKey) {
    try {
      const data = await retryFetch(
        `https://api.mixcloud.com${modifiedKey}?metadata=1&limit=${limit}`
      );

      const discoverTag =
        data.type === "discover_tag" && `${orderValue} ${data.name}`;

      if (data.type && data.type === "cloudcast") {
        return { shows: getFilteredShows([data]) };
      } else if (data.data && data.data.length > 0) {
        return { shows: getFilteredShows(data.data) };
      } else if (data.metadata?.connections) {
        const cloudcastsEndpoint =
          data.metadata.connections?.cloudcasts ||
          data.metadata.connections?.[orderValue];

        const cloudcasts = await retryFetch(
          cloudcastsEndpoint + `?metadata=1&limit=${limit}`
        );

        if (cloudcasts.data && cloudcasts.data.length > 0) {
          const cloudcastsData =
            orderValue === "popular"
              ? shuffle(cloudcasts.data?.slice())
              : cloudcasts.data;
          return {
            label: discoverTag,
            shows: getFilteredShows(cloudcastsData),
          };
        }
      }
    } catch (error) {
      console.log("fetchShows error ", error);
      throw error;
    }
  }
};

export const fetchSearchResults = async ({
  text,
  limit = 12,
  type = "tag",
}: {
  text: string;
  limit?: number;
  type?: string;
}) => {
  if (text.length < 2) return null;
  try {
    const data = await retryFetch(
      `https://api.mixcloud.com/search/?q=${text}&type=${type}&limit=${limit}`
    );

    return data;
  } catch (error) {
    console.log("fetchSearch error ", error);
    throw error;
  }
};
