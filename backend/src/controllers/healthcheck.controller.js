// filepath: f:\Backend-series\MY-TUBE\src\controllers\healthcheck.controller.js
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { status: "ok" }, "Server is healthy"));
});

export { healthcheck };
