import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const newsSources = [
  "https://hn.algolia.com/api/v1/search?tags=front_page",
  "https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=8",
];

const getNews = asyncHandler(async (_req, res) => {
  for (const source of newsSources) {
    try {
      const response = await fetch(source, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) continue;
      const payload = await response.json();
      const stories = Array.isArray(payload?.hits)
        ? payload.hits
            .filter((item) => item?.url && item?.title)
            .slice(0, 8)
            .map((item) => ({
              title: item.title,
              url: item.url,
              by: item.author || "Hacker News",
              time: item.created_at_i || 0,
            }))
        : [];
      if (stories.length) {
        return res.json(
          new ApiResponse(200, stories, "News fetched successfully")
        );
      }
    } catch {
      // Try the next configured source.
    }
  }

  return res
    .status(503)
    .json(new ApiResponse(503, [], "News is temporarily unavailable"));
});

export { getNews };
