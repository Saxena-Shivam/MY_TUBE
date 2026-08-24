import { getVideoDurationInSeconds } from "get-video-duration";

export async function getVideoDuration(filePath) {
  return await getVideoDurationInSeconds(filePath);
}
