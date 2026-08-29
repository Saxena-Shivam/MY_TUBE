import { Router } from "express";
import {
  addComment,
  addTweetComment,
  deleteComment,
  getTweetComments,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { optionalJWT, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/tweet/:tweetId")
  .get(optionalJWT, getTweetComments)
  .post(verifyJWT, addTweetComment);
router
  .route("/:videoId")
  .get(optionalJWT, getVideoComments)
  .post(verifyJWT, addComment);
router
  .route("/c/:commentId")
  .delete(verifyJWT, deleteComment)
  .patch(verifyJWT, updateComment);

export default router;
